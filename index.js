const AWS = require('aws-sdk');

//set AWS region to virgia (required for rekogtion)
AWS.config.update({region:'us-east-1'});

//set S3
const s3 =  new AWS.S3();

//set rekignition
const reko = new AWS.Rekognition();

//set bucket
const params = {
  Bucket: 'fa-imagens-ivan'
};

//list objects from S3
const listObjects =  new Promise(function(resolve, reject){
  let images = [];
  s3.listObjects(params, function(err, data){
    if(err){
      console.log(err);
      reject(err);
    }
    data.Contents.map(image => {
      images.push(image.Key);
    })
    resolve(images);
  });

});

//create rekognition collection of faces
const createCollection = function(){
    const params = {
      CollectionId: "faces"
    }
    reko.createCollection(params, function(err, data){
      if(err){
        throw err
      }

      console.log(data);
      return data;

    })
}

//index faces from S3 bucket on created collection
const indexColection = function(images){
  images.map(image => {
    reko.indexFaces({
      CollectionId: 'faces',
      DetectionAttributes: [],
      ExternalImageId: image.slice(0, -4),
      Image: {
        S3Object: {
        Bucket: "fa-imagens-ivan",
        Name: image
      }
    }
  }, function(err, data){
    if(err){
      throw err
    }
    console.log(JSON.stringify(data.FaceRecords));
    return data
  })
  });

}

//execution 
const images = listObjects
  .then(
    (images) => {
      indexColection(images);
  })
