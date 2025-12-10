const { sequelize, Budget, ApprovalRule, ApprovalStep, Validator, Entity } = require('../models');

// Disable logging for cleaner output
sequelize.options.logging = false;

async function diagnose() {
    try {
        console.log('=== DIAGNOSTIC REPORT ===\n');

        // 1. Get the latest budget
        const budget = await Budget.findOne({
            order: [['createdAt', 'DESC']],
            include: [{ model: Entity }]
        });

        if (!budget) {
            console.log('❌ No budgets found in database.');
            return;
        }

        console.log('📋 LATEST BUDGET:');
        console.log(`   ID: ${budget.id}`);
        console.log(`   Entity: ${budget.Entity ? budget.Entity.name : 'None'} (ID: ${budget.entity_id})`);
        console.log(`   Status: ${budget.status}`);
        console.log(`   Current Approval Step: ${budget.current_approval_step}`);
        console.log(`   Amount: ${budget.total_budget_local}`);
        console.log('');

        // 2. Get approval rules for this entity
        const rules = await ApprovalRule.findAll({
            where: { entity_id: budget.entity_id }
        });

        console.log(`📜 APPROVAL RULES for Entity ${budget.entity_id}:`);
        if (rules.length === 0) {
            console.log('   ❌ No approval rules found!');
        } else {
            for (const rule of rules) {
                console.log(`   Rule ID: ${rule.id}`);
                console.log(`   Group Number: ${rule.group_number}`);
                console.log(`   Min Amount: ${rule.min_amount}, Max Amount: ${rule.max_amount}`);
                console.log(`   Approvers (IDs): ${JSON.stringify(rule.approvers)}`);

                // Check if rule applies to this budget
                const amount = parseFloat(budget.total_budget_local);
                const applies = amount >= rule.min_amount && (rule.max_amount === null || amount <= rule.max_amount);
                console.log(`   Applies to budget? ${applies ? '✅ YES' : '❌ NO'}`);
                console.log('');
            }
        }

        // 3. Get validators
        console.log('👥 VALIDATORS:');
        const validators = await Validator.findAll();

        for (const v of validators) {
            console.log(`   Validator ID: ${v.id}`);
            console.log(`   Name: ${v.name}`);
            console.log(`   Email: ${v.email}`);
            console.log(`   User ID: ${v.user_id}`);
            console.log(`   Active: ${v.isActive}`);
            console.log('');
        }

        // 4. Check approval steps
        console.log('✅ APPROVAL STEPS for this budget:');
        const steps = await ApprovalStep.findAll({
            where: {
                object_type: 'Budget',
                object_id: budget.id
            }
        });

        if (steps.length === 0) {
            console.log('   No approval steps recorded yet.');
        } else {
            for (const step of steps) {
                console.log(`   Approver ID: ${step.approver_id}, Decision: ${step.decision}, Date: ${step.decision_date}`);
            }
        }
        console.log('');

        // 5. Simulate task filtering
        console.log('🔍 TASK FILTERING SIMULATION:');
        for (const validator of validators) {
            console.log(`   Checking for Validator ${validator.id} (${validator.email}):`);

            // Find rules where this validator is an approver
            const validatorRules = rules.filter(r =>
                Array.isArray(r.approvers) && r.approvers.includes(validator.id)
            );

            if (validatorRules.length === 0) {
                console.log(`     ❌ Not assigned to any approval rules`);
                continue;
            }

            const allowedGroups = validatorRules.map(r => r.group_number);
            console.log(`     Assigned to groups: ${allowedGroups.join(', ')}`);
            console.log(`     Budget current_approval_step: ${budget.current_approval_step}`);
            console.log(`     Should see task? ${allowedGroups.includes(budget.current_approval_step) ? '✅ YES' : '❌ NO'}`);
            console.log('');
        }

    } catch (error) {
        console.error('Error during diagnosis:', error);
    } finally {
        await sequelize.close();
    }
}

diagnose();
