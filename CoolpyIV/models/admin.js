module.exports = {
    ukey: { type: String, unique: true },
    userId: { type: String, required: true, validate: strLenValidator, unique: true },
    pwd: { type: String, required: true , validate: strLenValidator },
    userName: { type: String, required: true , validate: strLenValidator },
    email: { type: String, required: true , validate: strLenValidator },
    qq: { type: String, required: true , validate: strLenValidator }
};