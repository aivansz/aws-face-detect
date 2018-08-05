const AWS = require('aws-sdk');

AWS.config.update({region:'us-east-1'});

const s3 =  new AWS.S3();

const reko = new AWS.Rekognition();

const params = {
  Bucket: 'fa-imagens-ivan'
};

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
    console.log(...data.FaceRecords);
    return data
  })
  });

}

const images = listObjects
  .then(
    (images) => {
      indexColection(images);
  })
