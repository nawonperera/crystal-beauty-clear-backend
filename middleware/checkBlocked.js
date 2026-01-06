const checkBlocked = (req, res, next) => {
    try {
        if (req.user.isDisabled === false) {
            return res.status(403).json({ message: "Your account is blocked" });
        }
        next();
    } catch (err) {
        console.log(err);
    }
};

export default checkBlocked;
