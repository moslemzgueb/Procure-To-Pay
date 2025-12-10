const { Vendor } = require('../models');

exports.getVendors = async (req, res) => {
    try {
        const vendors = await Vendor.findAll();
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vendors', error: error.message });
    }
};

exports.createVendor = async (req, res) => {
    try {
        const vendor = await Vendor.create(req.body);
        res.status(201).json(vendor);
    } catch (error) {
        res.status(500).json({ message: 'Error creating vendor', error: error.message });
    }
};

exports.updateVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Vendor.update(req.body, { where: { id } });
        if (updated) {
            const updatedVendor = await Vendor.findByPk(id);
            res.json(updatedVendor);
        } else {
            res.status(404).json({ message: 'Vendor not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating vendor', error: error.message });
    }
};
