const { sequelize, ApprovalRule, Validator } = require('../models');

sequelize.options.logging = false;

async function checkRules() {
    try {
        console.log('=== APPROVAL RULES ===\n');

        const rules = await ApprovalRule.findAll({
            where: { entity_id: 1 }
        });

        if (rules.length === 0) {
            console.log('❌ NO APPROVAL RULES FOUND FOR ENTITY 1!');
            console.log('\nYou need to configure approval rules in the Entity settings.');
        } else {
            for (const rule of rules) {
                console.log(`Rule ID: ${rule.id}`);
                console.log(`Group: ${rule.group_number}`);
                console.log(`Approvers: ${JSON.stringify(rule.approvers)}`);
                console.log(`Amount Range: ${rule.min_amount} - ${rule.max_amount || 'unlimited'}`);
                console.log('');
            }
        }

        console.log('\n=== VALIDATORS ===\n');
        const validators = await Validator.findAll();

        if (validators.length === 0) {
            console.log('❌ NO VALIDATORS FOUND!');
        } else {
            for (const v of validators) {
                console.log(`ID: ${v.id}, Email: ${v.email}, Name: ${v.name}`);
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkRules();
