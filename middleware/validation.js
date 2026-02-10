module.exports = function Validate(schema) {
    return (req, res, next) => {
        for (let key in schema) {
            console.log(key);

            const { value, error } = schema[key].validate(req[key], { stripUnknown: true });

            if (error) {
                return res.status(422).json({
                    error: error?.details,
                })
            }
            req[key] = value;
        }
        next();
    };
};