import { validationResult } from 'express-validator';
export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            message: 'Input validation failed',
            errors: errors.array().map(err => ({
                field: err.type === 'field' ? err.path : '',
                message: err.msg
            }))
        });
        return;
    }
    next();
};
