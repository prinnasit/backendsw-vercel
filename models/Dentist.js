const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const DentistSchema = new mongoose.Schema({
    name:{
        type: String ,
        required:[true , 'Please add a name '],
        trim : true ,
        maxlength:[50, 'Name can not be more than 50 characters']
    } ,
    yearsOfExperience:{
        type: String,
        required:[true, 'Please add years of experience']
    },
    areaOfExpertise:{
        type: String,
        required:[true, 'Please add an area of expertise']
    },
    picture: {
        type: String,
        default: '/img/no-photo.png',
        required:[true, "Please add a link to Dentist's picture"]   
    },
} ,

{
    toJSON: {virtuals : true} ,
    toObject:{virtuals : true}
}
);

//Reverse populate with virtuals
DentistSchema.virtual('appointments',{
    ref : 'Appointment',
    localField: '_id',
    foreignField: 'dentist',
    justOne:false 
}) ;

//Cascade delete appointments when a dentist is deleted 
DentistSchema.pre('deleteOne' , {document: true , query :false} , async function(next){
    console.log(`Appointments being removed from dentist ${this._id}`) ;
    await this.model('Appointment').deleteMany({dentist: this._id}) ;
    next() ;
}) ;


module.exports=mongoose.model('Dentist' , DentistSchema) ;