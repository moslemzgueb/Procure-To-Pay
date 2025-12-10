const { sequelize, Budget, ApprovalRule, ApprovalStep, User, Entity, Validator } = require('../models');

// Disable logging for cleaner output
sequelize.options.logging = false;

async function debugBudgetState() {
    try {
        console.log('--- Debugging Budget State ---');

        // 1. Get the latest Budget
        const budget = await Budget.findOne({
            order: [['createdAt', 'DESC']],
            include: [{ model: Entity }]
        });

        if (!budget) {
            console.log('No budgets found.');
            return;
        }

        console.log(`Latest Budget ID: ${budget.id}`);
        console.log(`Status: ${budget.status}`);
        console.log(`Entity: ${budget.Entity ? budget.Entity.name : 'None'} (ID: ${budget.entity_id})`);
        console.log(`Amount: ${budget.total_budget_local}`);
        console.log(`Current Approval Step: ${budget.current_approval_step}`);

        // 2. Get Approval Rules for this Entity
        const rules = await ApprovalRule.findAll({
            where: { entity_id: budget.entity_id },
            include: [
                {
                    model: ApprovalStep,
                    include: [{ model: User, as: 'Approver' }]
                }
            ]
        });

        console.log(`\nFound ${rules.length} Approval Rules for Entity ${budget.entity_id}:`);

        for (const rule of rules) {
            console.log(`  Rule ID: ${rule.id}`);
            console.log(`  Min Amount: ${rule.min_amount}, Max Amount: ${rule.max_amount}`);

            // Check if this rule applies
            const amount = parseFloat(budget.total_budget_local);
            const applies = amount >= rule.min_amount && (rule.max_amount === null || amount <= rule.max_amount);
            console.log(`  Applies to this budget? ${applies ? 'YES' : 'NO'}`);

            if (applies) {
                console.log(`  Steps:`);
                const sortedSteps = rule.ApprovalSteps.sort((a, b) => a.step_number - b.step_number);
                for (const step of sortedSteps) {
                    console.log(`    Step ${step.step_number}: Approver ID ${step.approver_id} (${step.Approver ? step.Approver.email : 'Unknown'})`);
                }
            }
        }

    } catch (error) {
        console.error('Error debugging budget:', error);
    } finally {
        await sequelize.close();
    }
}

debugBudgetState();
