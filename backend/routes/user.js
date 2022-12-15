const express = require( "express" );
const router = express.Router();
const authUser = require( "../common/authUser" )


router.post( '/users/login', (req, res) => {
    res.send( 'hello World' );
} )

router.post( '/logout' , authUser ,(req, res) => {

    // user.token elérhető
    res.send( 'Lefutott a NExt' );
} )

router.post( '/regist', (req, res) => {
    res.send( 'hello World' );
} )

//next() = move on to the next section express built in function
// const getToken = (res, res, next) => {

//     var user;

//     //Data Base Elérés
    
//     try {
        
//         user = db.getUserTOken( req.params.token );
        
//         if( user === null ){
//           res.status(404).json( {message: "token not found"} );
//         }

//     } catch (error) {
//         return res.status(500).json({message : error.message});
//     }

//     res.user = user;
//     next();

// }

module.exports = router;