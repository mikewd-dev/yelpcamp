//we return a function, that accepts a function
//then it executes that function but catches any errors
//which are then passed to next, if any


module.exports = func => {
    return (req, res, next) =>{
        func(req, res, next).catch(next);
    }
}