'use strict';

/* Controllers */

function MainCtrl($rootScope, $scope, $resource, Participants, Sessions, AccessCouch) {

//Add authentication here
	
	
//Query data; assign to template scope; initialize default values
	
	$scope.sessions = Sessions.query();  
	$scope.childs = Participants.query();

//Variables for ng-show directives		
	$rootScope.testing = 'false';
	$scope.searching = 'true';
	$scope.editing = 'false';
	$scope.showAddlReports = 'false';

	$scope.headphonesAlert = function() {
		window.alert("Please plug in headphones to continue.");
	};
	
	
//Test to see if text in search box returns any results and hide/display divs accordingly	
	
	$scope.displaySearchResults = function(resultsCount) {	
		if (resultsCount == 0) {
			$scope.searching = 'true';
			window.alert('No matching results.');
		}
		else {
			$scope.searching = 'false';
			$scope.orderProp = 'lastName';
			$scope.currentResult = 0;
	    	$scope.resultSize = 5;
	    	$scope.numberOfResultPages = function(){
	    		return Math.ceil(resultsCount/$scope.resultSize);
	    	};
	    }
	};
	
//Hide Edit/Show cancel/save buttons; make template content editable via ng-show
	
	$scope.edit = function() {
		$scope.editing = 'true';
	}

/*TRY TO FIND ANOTHER WAY TO REFRESH THE VIEW*/	
	$scope.cancel = function() {
		window.location.reload();
	}	
	
//Save changes made to edited fields; push changes to CouchDB	
	
	$scope.saveRecord = function(records) {
		var newRecord = records;
		var currentUUID = records._id;
		var updatedRecord = AccessCouch.query({UUID: currentUUID}, function() {
			for (key in newRecord) {
				updatedRecord[key] = newRecord[key];
			}
			updatedRecord.$update({UUID: currentUUID});
		});
		$scope.editing = 'false';
	};
	
};

function SessionReportCtrl($scope, $routeParams) {

//Set template filter value to value of sessionID in routeParams
	
	$scope.filterProp = $routeParams.sessionID;
	
};

function ParticipantReportCtrl($scope, $routeParams) {

//Set template filter value to value of participantID in routeParams	
	
	$scope.filterProp = $routeParams.participantID;
	
	$scope.loadReport = function (pathParams, participantID) {
		window.location='#/reports/' + pathParams + '/' + participantID;
	}
	
};

function SAILSCtrl($rootScope, $scope, $routeParams) {
	var sailsAudio = [ "GR02A_Gris_MOD.mp3",
	                   "GR19A_Gris_MOD.mp3", "GR27D_Gris_MOD.mp3", "GR04A_Gris_MOD.mp3",
	                   "GR20A_Gris_MOD.mp3", "GR28A_Gris_MOD.mp3", "GR05A_Gris_MOD.mp3",
	                   "GR20B_Gris_MOD.mp3", "NI29A_Gris_MOD.mp3", "GR06A_Gris_MOD.mp3",
	                   "GR20C_Gris_MOD.mp3", "NI29B_Gris_MOD.mp3", "GR10B_Gris_MOD.mp3",
	                   "GR21A_Gris_MOD.mp3", "NI30A_Gris_MOD.mp3", "GR12A_Gris_MOD.mp3",
	                   "GR21B_Gris_MOD.mp3", "NI32A_Gris_MOD.mp3", "GR16B_Gris_MOD.mp3",
	                   "GR21C_Gris_MOD.mp3", "NI33A_Gris_MOD.mp3", "GR17A_Gris_MOD.mp3",
	                   "GR27A_Gris_MOD.mp3", "GR18A_Gris_MOD.mp3", "GR27C_Gris_MOD.mp3" ];
	
	$rootScope.testing = 'true';
	$scope.experimentType = "sails";
	$scope.currentStimulus = 0;
	
	$scope.confirmChoice = function() {
		var r = confirm("Are you sure?");
	    if (r == true) {
	      $scope.nextStimulus();
	    } else {
	      // do nothing
	    }
	};
	$scope.nextStimulus = function() {
		document.getElementById("audio_instructions_player_source").pause();
		  $scope.audioStimulus = "audio_stimuli/"+ $scope.experimentType+"/"+sailsAudio[$scope.currentStimulus];
		  document.getElementById("audio_stimuli_player_source").addEventListener('canplaythrough', function () {
				  document.getElementById("audio_stimuli_player_source").play()
		  });

		  $scope.currentStimulus++;
		  var imagenumber= $scope.currentStimulus;
		    if(imagenumber < 10 ){
		      imagenumber = "0"+imagenumber;
		    }
		    imagenumber = "/r"+imagenumber+"_mouse_cheese.png";
		    document.getElementById("reinforcement_image").src = "image_stimuli/"+$scope.experimentType+imagenumber;
		  
		  if($scope.currentStimulus >= sailsAudio.length){
		    window.alert("Good Job!");
		    window.location.replace("#/test/sails/congratulations");
		  }

	};
	
	$scope.noSave = function () {
		window.location.replace('#/test');
	};
	
};

function NewUserCtrl($scope, Participants, AccessCouch) {
	
	$scope.cancel = function() {
		location.reload();
	};
	
	$scope.createNewUser = function(data) {
			var currentParticipantIDs = Participant.query(function() {
				var newParticipantID = generateNewParticipantID(currentParticipantIDs);
				if (newParticipantID == undefined) {
					window.alert("Please try again."); //should this just call generateNewParticipantID() again? 
				}
				else {
					data.JSONType = "participant";
					data.participantID = newParticipantID;
					var newUser = AccessCouch.save(data, function() {
						window.alert("New user created. New user Participant ID: " + newParticipantID);
						window.location = "index.html";
					});
				}
			});
			
	};
};


function SaveYourScoreCtrl($scope, ParticipantsAutocomplete) {
	
};

function ReportsCtrl($scope, $routeParams) {
	$scope.filterProp = $routeParams.participantID;
};

//End controllers

function generateNewParticipantID(data) {
	var randomParticipantID=Math.floor(Math.random()*(999999 - 100000 + 1)) + 100000;
	var duplicatedID;
	//Make sure randomly generated ID doesn't already exist
	for (var i = 0; i < data.rows.length; i++) {
		if (randomParticipantID == data.rows[i].value.participantID) {
			duplicatedID = 1;
		}
		else {
			duplicatedID = 0;
		}
	}
	if (duplicatedID == 0) {
		return randomParticipantID;
	}
	else {
		return;	
	}
}



//PartcipantListCtrl.$inject = ['$scope', '$http'];
