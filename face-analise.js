const AWS = require('aws-sdk');

//set AWS region to virgia (required for rekogtion)
AWS.config.update({region:'us-east-1'});

//set S3
const s3 =  new AWS.S3();

//set rekignition
const reko = new AWS.Rekognition();

//index faces for recogtion
const faceDetect = new Promise(function(resolve, reject){

    reko.indexFaces({
      CollectionId: 'faces',
      DetectionAttributes: ['DEFAULT'],
      ExternalImageId: 'temp',
      Image: {
        S3Object: {
          Bucket: "fa-imagens-ivan",
          Name: '_compared.jpg'
        }
      }
    }, function(err, data){
        if(err){
          reject(err);
        }
        resolve(data);
    });

});

//list Ids of recognized faces
const listDetectedFaces = function(detectedFaces){
  faceIds = [];
  detectedFaces.FaceRecords.map(detected => {
    faceIds.push(detected.Face.FaceId);
  });
  return faceIds;
}



//search for a face in collection that matches a certain face Id
const searchFaces = function(id){

  return new Promise((resolve, reject)=>{
    reko.searchFaces({
      CollectionId: 'faces',
      FaceId: id, 
      FaceMatchThreshold: 80,
      MaxFaces: 10
    }, function(err, data){
        if(err){
          throw reject(err);
        }
        resolve(data);      
    });
  });

}

//serach each Id matches in face collecton
const imageCompare = function(faceIds){

    let faces = []
    for(let i = 0; i < faceIds.length; i ++){
      let face = searchFaces(faceIds[i]);
      faces.push(face);    
    }

    return faces;
}

//format matche response
const formatResponse = function(res){
  let formated = [];
  res.map(searched => {
    let searchedId = searched.SearchedFaceId;

    let match = [];
    searched.FaceMatches.map(found => {  
      match.push({
        id: found.Face.FaceId,
        name: found.Face.ExternalImageId,
        confidence: found.Face.Confidence
      });
    });
    let foundFace = match;
    
    formated.push({
      id: searchedId,
      found: foundFace
    });
  });
  return formated;
}


//execution
faceDetect.then(detectedFaces => {
  const faces = listDetectedFaces(detectedFaces);
  Promise.all(imageCompare(faces))
    .then(faces => {
      console.log('Searched::::::::::', JSON.stringify(formatResponse(faces)));
    })
    .catch(err => {
      console.log(err)
      console.log('catch');
    });
})
.catch(err => console.log(err));
