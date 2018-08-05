const AWS = require('aws-sdk');

const s3 =  new AWS.S3();

const reko = new AWS.Rekognition();



const faceDetect = function(){
  const detected = reko.indexFaces({
    CollectionId: 'faces',
    DetectionAttributes: ['DEFAULT'],
    ExternalImageId: 'temp',
    Image: {
      S3Object: {
        Bucket: "fa-imagens-ivan",
        Name: '_compared.jpg'
      }
    }
  });

  return detected;
}

const detected = faceDetect();
console.log(detected);
