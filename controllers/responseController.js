module.exports = {
    responseJSON: (req, res, next) => {
        res.json({
            success: res.locals.success,
            data: res.locals.data
        });

        res.end();
    },

    errorJSON: (err, req, res, next) => {
        res.json({
            success: res.locals.success,
            data: res.locals.data
        });

        res.end();
    }
};