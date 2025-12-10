const { SystemSetting } = require('../models');

exports.getSettings = async (req, res) => {
    try {
        const settings = await SystemSetting.findAll();
        // Convert array to object for easier frontend consumption { key: value }
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });
        res.status(200).json(settingsMap);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Error fetching settings' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const settings = req.body;
        const keys = Object.keys(settings);

        for (const key of keys) {
            await SystemSetting.upsert({
                key: key,
                value: settings[key]
            });
        }

        res.status(200).json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Error updating settings' });
    }
};
