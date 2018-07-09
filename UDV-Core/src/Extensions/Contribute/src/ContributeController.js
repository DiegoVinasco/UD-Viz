import { CreateDocument }  from './CreateDocument.js';
import { UpdateDocument }   from './UpdateDocument.js';
import "./Contribute.css";
import "./creation.css";
import { MAIN_LOOP_EVENTS } from 'itowns';

export function ContributeController(documentController){

  this.documentController = documentController;

  this.documentCreate;
  this.documentUpdate;
  this.creationContainerId = "creationContainer";
  this.updateContainerId = "updateContainer";
  this.url = this.documentController.url + "app_dev.php/addDocument";

  this.newDocData = null;
  this.docPos = new THREE.Vector3();//DEBUG
  this.docQuat =  new THREE.Quaternion();//DEBUG
  this.chosenPosition =  new THREE.Vector3()
  this.chosenQuaternion =  new THREE.Quaternion();

  this.validPosition = true;

  this.initialize = function initialize(){
    var updateContainer = document.createElement("div");
    updateContainer.id =   this.updateContainerId;
    document.body.appendChild(updateContainer);
    this.documentUpdate = new UpdateDocument(updateContainer, this);

    var creationContainer = document.createElement("div");
    creationContainer.id = this.creationContainerId;
    document.body.appendChild(creationContainer);
    this.documentCreate = new CreateDocument(creationContainer, this);

  }

  this.addVisualizationData = function addVisualizationData(){
    //close debug window
    //verify position
    this.docPos = new THREE.Vector3(document.getElementById("setPosX").value,
                                    document.getElementById("setPosY").value,
                                    document.getElementById("setPosZ").value
                                                                            );
    this.docQuat = new THREE.Quaternion(document.getElementById("quatX").value,
                                        document.getElementById("quatY").value,
                                        document.getElementById("quatZ").value,
                                        document.getElementById("quatW").value
                                                                          );
    document.getElementById('manualPos').style.display = "none";

  }

this.moveDoc = function moveDoc(){
  this.chosenPosition.x = document.getElementById("setPosX").value;
  this.chosenPosition.y = document.getElementById("setPosY").value;
  this.chosenPosition.z = document.getElementById("setPosZ").value;
  this.chosenQuaternion.x = document.getElementById("quatX").value;
  this.chosenQuaternion.y = document.getElementById("quatY").value;
  this.chosenQuaternion.z = document.getElementById("quatZ").value;
  this.chosenQuaternion.w = document.getElementById("quatW").value;
  this.documentController.controls.initiateTravel(this.chosenPosition,"auto",this.chosenQuaternion,true);
}

this.colorField = function colorField(id){
  document.getElementById(id).style.borderColor = "red";
}

this.formDataVerification = function formDataVerification(){

  var dataIsValid = true;
  var data = new FormData(document.getElementById('creationForm'));

  var txt ="Please provide ";
  for (var pair of data.entries() ){

    if( pair[1] == ""){
      if(pair[0] == "link"){
        txt += "file ";

        dataIsValid = false;
      }
      else{
        txt += pair[0] + ", ";
        var id = "create_"+pair[0];
        this.colorField(id);
        dataIsValid = false;

      }
    }

  }
  if(!dataIsValid){
    alert(txt);
  }
  return dataIsValid;

}

  this.documentCreation = function documentCreation(){
    this.newDocData = new FormData(document.getElementById('creationForm'));
    if (this.docPos != null || this.docQuat != null){
      this.validPosition = true;
    this.newDocData.append("positionX", this.docPos.x);
    this.newDocData.append("positionY", this.docPos.y);
    this.newDocData.append("positionZ", this.docPos.z);
    this.newDocData.append("quaternionX",this.docQuat.x);
    this.newDocData.append("quaternionY",this.docQuat.y);
    this.newDocData.append("quaternionZ",this.docQuat.z);
    this.newDocData.append("quaternionW",this.docQuat.w);
    this.newDocData.append("billboardX", this.docQuat.y);
  }
  else{
    this.validPosition = false;
  }

    this.addDocument(this.newDocData, function(){});

    if(this.dataIsValid & this.validPosition ){
      $("#creationForm").get(0).reset();
    }

    else{
      alert('Document could not be created, check information');
    }
/*
    //DEBUG
    for (var pair of this.newDocData.entries() ){
      console.log(pair[0] + ":" + pair[1]);
    }*/

  }


  this.documentShowPosition = function documentShowPosition(){

    var cam = this.documentController.view.camera.camera3D;
    var position = cam.position;
    var quaternion = cam.quaternion;
    document.getElementById("setPosX").value = position.x;
    document.getElementById("setPosY").value = position.y;
    document.getElementById("setPosZ").value = position.z;
    document.getElementById("quatX").value = quaternion.x;
    document.getElementById("quatY").value = quaternion.y;
    document.getElementById("quatZ").value = quaternion.z;
    document.getElementById("quatW").value = quaternion.w;

  }

  this.addDocument = function addDocument(data, callback){
    //check if visualizationdata has been given
    if (this.docPos == null || this.docQuat == null){
      alert("You must place your document in the scene");
      this.documentCreate.showDocPositioner();
    }
    else{
      if(this.formDataVerification()==true){
        var req = new XMLHttpRequest();
        req.open("POST", this.url);

        req.addEventListener("load", function () {

          if (req.status >= 200 && req.status < 400) {
            console.log(req.status)
            //update creation status
            callback(req.responseText);
            alert('Your document was sucessfuly uploaded');
          }
          else {
            console.error(req.status + " " + req.statusText + " " + this.url);
          }
        });
        req.addEventListener("error", function () {
          console.error("Network error with url: " + url);
        });
        req.send(data);
      }}
  }

  this.updateCamPos = function updateCamPos(){
    this.documentShowPosition();
  }

  this.documentController.view.addFrameRequester( MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,this.updateCamPos.bind(this) );

  this.initialize();

}
