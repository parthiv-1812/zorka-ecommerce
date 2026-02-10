const Joi = require("joi");
const db = require("../schema");

module.exports = {

    addCategory: {
        validation: {
            body: Joi.object({
                name: Joi.string().required(),
            }),
        },
        handler: async (req, res) => {
            try {
                const { name } = req.body;

                const existing = await db.category.findOne({ name });
                if (existing) {
                    return res.status(400).json({ message: "Category already exists" });
                }

                let imageUrl = null;
                if (req.file) {
                    imageUrl = "http://localhost:8080/files/" + req.file.filename;
                }

                const category = await db.category.create({ name, image: imageUrl });
                return res.status(201).json({
                    message: "Category created successfully",
                    categories: category
                });

            } catch (error) {
                return res.status(500).json({
                    message: error.message
                });
            }
        }
    },

    updateCategory: {
        validation: {
            body: Joi.object({
                name: Joi.string().optional(),
            }),
        },
        handler: async (req, res) => {
            try {
                const updateData = { ...req.body };

                if (req.file) {
                    updateData.image = "http://localhost:8080/files/" + req.file.filename;
                }

                const category = await db.category.findByIdAndUpdate(
                    req.params.id,
                    { $set: updateData },
                    { new: true, runValidators: true }
                );

                if (!category)
                    return res.status(404).json({
                        message: "Category not found"
                    });

                return res.json({
                    message: "Category updated successfully",
                    category: category
                });

            } catch (error) {
                return res.status(500).json({
                    message: error.message
                });
            }
        }
    },

    getCategories: {
        validation: {
            query: Joi.object({
                page: Joi.number().default(0),
                limit: Joi.number().default(20),
                search: Joi.string().optional(),
            }),
        },

        handler: async (req, res) => {
            try {
                const { page, limit, search } = req.query;
                const query = search ? { name: { $regex: search, $options: "i" } } : {};

                const categories = await db.category
                    .find(query)
                    .skip(page * limit)
                    .limit(limit)
                    .sort({ createdAt: -1 });

                const total = await db.category.countDocuments(query);

                return res.json({
                    message: "Categories fetched successfully",
                    categories : { total, categories }
                });
            } catch (error) {
                return res.status(500).json({ message: error.message });
            }
        }
    },

    getCategoryById: {
        validation: {
            params: Joi.object({
                id: Joi.string().required(),
            }),
        },

        handler: async (req, res) => {
            try {
                const category = await db.category.findById(req.params.id);
                if (!category) return res.status(404).json({ message: "Category not found" });

                return res.json({
                    message: "Category fetched successfully",
                    data: category
                });
            } catch (error) {
                return res.status(500).json({ message: error.message });
            }
        }
    },

    deleteCategory: {
        validation: {
            params: Joi.object({
                id: Joi.string().required(),
            }),
        },

        handler: async (req, res) => {
            try {
                const category = await db.category.findByIdAndDelete(req.params.id);
                if (!category) return res.status(404).json({ message: "Category not found" });

                return res.json({
                    message: "Category deleted successfully",
                    data: category
                });
            } catch (error) {
                return res.status(500).json({ message: error.message });
            }
        }
    }

};
