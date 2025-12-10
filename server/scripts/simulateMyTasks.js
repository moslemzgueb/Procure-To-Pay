const { sequelize, Budget, ApprovalRule, Validator } = require('../models');
const { Op } = require('sequelize');

sequelize.options.logging = false;

async function simulateMyTasks() {
    try {
        const userId = 2; // moslemzgueb@gmail.com user ID

        console.log(`=== SIMULATING MY TASKS for User ID ${userId} ===\n`);

        // Find the validator profile for this user
        const validator = await Validator.findOne({ where: { user_id: userId } });

        if (!validator) {
            console.log('❌ No validator found for this user!');
            return;
        }

        console.log(`✅ Validator found: ID ${validator.id}, Email: ${validator.email}\n`);

        // Find ALL approval rules (we'll filter in JavaScript)
        const allRules = await ApprovalRule.findAll();

        console.log(`Found ${allRules.length} total rules in database:\n`);

        // Map entity_id -> list of group_numbers where this validator is an approver
        const validatorGroupsByEntity = {};
        allRules.forEach(rule => {
            if (!validatorGroupsByEntity[rule.entity_id]) {
                validatorGroupsByEntity[rule.entity_id] = [];
            }
            // Check if validator is actually in the approvers list
            if (Array.isArray(rule.approvers) && rule.approvers.includes(validator.id)) {
                validatorGroupsByEntity[rule.entity_id].push(rule.group_number);
                console.log(`  Entity ${rule.entity_id}, Group ${rule.group_number}: Validator ${validator.id} is assigned`);
            } else {
                console.log(`  Entity ${rule.entity_id}, Group ${rule.group_number}: Validator ${validator.id} NOT in approvers`);
            }
        });

        const entityIds = Object.keys(validatorGroupsByEntity);
        console.log(`\nValidator is assigned to entities: ${entityIds.join(', ')}\n`);

        // Find budgets
        const budgets = await Budget.findAll({
            where: {
                entity_id: { [Op.in]: entityIds },
                status: 'SUBMITTED'
            },
            order: [['createdAt', 'DESC']]
        });

        console.log(`Found ${budgets.length} SUBMITTED budgets for these entities:\n`);

        // Filter budgets
        const myTasks = budgets.filter(budget => {
            const allowedGroups = validatorGroupsByEntity[budget.entity_id] || [];
            const matches = allowedGroups.includes(budget.current_approval_step);

            console.log(`  Budget ${budget.id}:`);
            console.log(`    Entity: ${budget.entity_id}`);
            console.log(`    Current step: ${budget.current_approval_step}`);
            console.log(`    Validator's allowed groups: [${allowedGroups.join(', ')}]`);
            console.log(`    Matches? ${matches ? '✅ YES' : '❌ NO'}`);
            console.log('');

            return matches;
        });

        console.log(`\n=== RESULT ===`);
        console.log(`Tasks that should appear: ${myTasks.length}`);

        if (myTasks.length > 0) {
            console.log('\nBudget IDs:', myTasks.map(b => b.id).join(', '));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

simulateMyTasks();
