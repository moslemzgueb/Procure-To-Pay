const { sequelize, Budget, ApprovalRule, Validator, User } = require('../models');

sequelize.options.logging = false;

async function fullDiagnosis() {
    try {
        // 1. Latest budget
        const budget = await Budget.findOne({
            order: [['createdAt', 'DESC']]
        });

        console.log('=== BUDGET ===');
        console.log(`ID: ${budget.id}, Status: ${budget.status}, Step: ${budget.current_approval_step}, Entity: ${budget.entity_id}\n`);

        // 2. Approval rules
        console.log('=== APPROVAL RULES ===');
        const rules = await ApprovalRule.findAll({
            where: { entity_id: budget.entity_id },
            order: [['group_number', 'ASC']]
        });

        for (const rule of rules) {
            console.log(`Group ${rule.group_number}: Validators ${JSON.stringify(rule.approvers)}`);
        }
        console.log('');

        // 3. All validators
        console.log('=== VALIDATORS ===');
        const validators = await Validator.findAll();
        for (const v of validators) {
            console.log(`ID ${v.id}: ${v.email}, UserID: ${v.user_id || 'NULL'}`);
        }
        console.log('');

        // 4. All users with approver role
        console.log('=== USERS (approver role) ===');
        const users = await User.findAll({
            where: { role: 'approver' }
        });
        for (const u of users) {
            console.log(`User ID ${u.id}: ${u.username}, Email: ${u.email || 'N/A'}`);
        }
        console.log('');

        // 5. Check which validator should see the task
        console.log('=== WHO SHOULD SEE THE TASK? ===');
        const currentStep = budget.current_approval_step;
        const currentRule = rules.find(r => r.group_number === currentStep);

        if (currentRule) {
            console.log(`Budget is at step ${currentStep}`);
            console.log(`Validators assigned to step ${currentStep}: ${JSON.stringify(currentRule.approvers)}`);

            for (const validatorId of currentRule.approvers) {
                const validator = validators.find(v => v.id === validatorId);
                if (validator) {
                    console.log(`\n  Validator ${validatorId} (${validator.email}):`);
                    console.log(`    Has user_id? ${validator.user_id ? 'YES (' + validator.user_id + ')' : 'NO - CANNOT LOGIN!'}`);

                    if (validator.user_id) {
                        const user = users.find(u => u.id === validator.user_id);
                        if (user) {
                            console.log(`    Login: ${user.username} / password123`);
                            console.log(`    ✅ Should see task in My Tasks`);
                        } else {
                            console.log(`    ❌ User ${validator.user_id} not found or not approver role!`);
                        }
                    }
                } else {
                    console.log(`\n  ❌ Validator ${validatorId} does not exist!`);
                }
            }
        } else {
            console.log(`❌ No rule found for step ${currentStep}!`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

fullDiagnosis();
