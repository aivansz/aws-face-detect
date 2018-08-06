const AWS = require('aws-sdk');

AWS.config.update({region:'us-east-1'});

const s3 =  new AWS.S3();

const reko = new AWS.Rekognition();



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

const listDetectedFaces = function(detectedFaces){
  faceIds = [];
  detectedFaces.FaceRecords.map(detected => {
    faceIds.push(detected.Face.FaceId);
  });
  return faceIds;
}

const imageCompare = function(faceIds){

  return new Promise(function(resolve, reject){
    for(let i = 0; i < faceIds.length; i ++){
      const result = []
      result.push(reko.searchFaces({
        CollectionId: 'faces',
        FaceId: faceIds[i],
        FaceMatchThreshold: 80,
        MaxFaces: 10
      }, function(err, data){
          if(err){
            throw reject(err);
          }
          return resolve(data);
      }));
    }
  });
}

const detected = faceDetect.then(detectedFaces => {
  //console.log(detectedFaces);
  const faces = listDetectedFaces(detectedFaces);
  console.log('faces: ', faces);
  imageCompare(faces).then(faces => console.log(JSON.stringify(faces)));
})
.catch(err => console.log(err));
