(function () {
    var app = angular.module("phoneStore", ["firebase", "ngMaterial"]);

    var iBsession = Math.floor(Math.random() * 10000000000) + 1;

    app.controller('phoneController', function ($scope, $firebaseArray, $firebaseObject) {

        var authClient = new Firebase("https://shining-heat-2975.firebaseio.com");

        var offerViewed = false;

        var offersRef = new Firebase("https://shining-heat-2975.firebaseio.com/acceptedOffers");
        var offersSync = $firebaseArray(offersRef);
        $scope.acceptedOffers = offersSync;

        this.phones = makesArray;

        this.conditionDescription = '';
        this.selectedCondition = '';

        //Add a note that we do NOT accept jail-broken phones or those locked to any other network
        this.networks = ['Mobinil', 'Vodafone', 'Etisalat', 'Factory Unlocked'];
        this.typicalOptions = ["Yes", "No", "Don't Know"];

        this.selectedPhone = 0;

        this.offerPrice = 0;

        this.readyForOffer = false;

        // Create a callback which logs the current auth state
        this.authDataCallback = function (user) {
            if (user) {
                $scope.user = user;
                if ($scope.phone.readyForOffer) $scope.phone.getPhoneOffer();
            } else {
                //Log out user
                $scope.user = null;
            }
        };
        // Register the callback to be fired every time auth state changes
        authClient.onAuth(this.authDataCallback);

        this.selectPhone = function (selection, selectedModel) {
            //Dummy function for now
            this.selectedPhone = selection;
            this.phoneModel = selectedModel;
        };

        this.validateInput = function () {
            if (this.userMobile == undefined || this.userEmail == undefined) {
                alert("Please enter your mobile number & e-mail address");
                return false;
            }
            var validPhone = /^\d{11}$/;
            var validEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
            if (!this.userMobile.match(validPhone)) {
                alert("Please enter a valid 11-digit mobile phone number (without any spaces or special characters)");
                return false;
            }
            if (this.userMobile != this.userMobileConfirmation) {
                alert("Entered mobile number and confirmation do not match");
                return false;
            }
            if (!this.userEmail.match(validEmail)) {
                alert("Please enter a valid e-mail address");
                return false;
            }
            if (this.userEmail != this.userEmailConfirmation) {
                alert("Entered e-mail address and confirmation do not match");
                return false;
            }
            return true;
        };

        this.backToSpecs = function () {
            this.offerPrice = 0;
            this.readyForOffer = false;
            this.offerViewed = false;
            $scope.offerAccepted = false;
        }

        this.restartSelection = function () {
            this.selectedPhone = 0;
            this.phoneModel = null;
            this.phoneNetwork = null;
            this.phoneStorage = null;
            this.phoneCondition = null;
            this.offerPrice = 0;
            $scope.offerAccepted = false;
            this.readyForOffer = false;
            this.userMobile = null;
            this.userEmail = null;
            this.userMobileConfirmation = null;
            this.userEmailConfirmation = null;
            this.offerViewed = false;
        };

        //START -- HANDLING PHONE SPECS CHECKBOXES

        $scope.cb_Storage = [];
        $scope.cb_Network = [];

        $scope.cb_BodyScratches = [];
        $scope.cb_BodyDents = [];
        $scope.cb_BodyCracks = [];

        $scope.cb_ScreenScratches = [];
        $scope.cb_ScreenCracks = [];
        $scope.cb_ScreenColoredSpots = [];
        $scope.cb_ScreenReplaced = [];

        $scope.cb_CamFrontProblem = [];
        $scope.cb_CamBackProblem = [];
        $scope.cb_CamFlashProblem = [];

        $scope.cb_BtnPwrProblem = [];
        $scope.cb_BtnVlmProblem = [];
        $scope.cb_BtnMutProblem = [];
        $scope.cb_BtnHomProblem = [];

        $scope.cb_SndMicProblem = [];
        $scope.cb_SndJckProblem = [];
        $scope.cb_SndSpkrProblem = [];
        $scope.cb_SndLdSpkrProblem = [];
        $scope.cb_SndEarPhnProblem = [];

        $scope.cb_SysCellProblem = [];
        $scope.cb_SysWiFiProblem = [];
        $scope.cb_SysBTProblem = [];

        $scope.cb_BatProblem = [];
        $scope.cb_BatReplaced = [];
        $scope.cb_BatDockProblem = [];
        $scope.cb_BatCblProblem = [];
        $scope.cb_BatChrgrProblem = [];



        //When an item is selected in the interface, reflect this in the value of the underlying array
        $scope.cb_toggleSelection = function (item, list, singleList) {

            //If selecting an item that must be selected alone...
            var checkSingle = singleList.indexOf(item);
            if (checkSingle > -1) return $scope.cb_toggleSingleSelection(item, list);

            //If selecting an item that can be selected with others, unselect the item that must be selected alone
            if (list.length > 0 && singleList.indexOf(list[0]) > -1) list.splice(0, 1);

            var itemId = list.indexOf(item);
            if (itemId > -1) list.splice(itemId, 1);
            else list.push(item);

            console.log(list);
        };

        //Selects the checked item and unselects all others
        $scope.cb_toggleSingleSelection = function (item, list) {
            list.splice(0, list.length);
            list.push(item);

            console.log(list);
        };

        //Check if a given item is selected in the list
        $scope.cb_isSelected = function (item, list) {
            var itemId = list.indexOf(item);
            if (itemId > -1) return true;
            else return false;
        };

        //END -- HANDLING PHONE SPECS CHECKBOXES

        this.isSelected = function (checkPhone) {
            return checkPhone == this.phone;
        };

        //This is triggered when the user has completed the phone specs form
        this.setReadyForOffer = function () {
            this.readyForOffer = true;
            this.getPhoneOffer();
        };

        this.getPhoneOffer = function () {
            if (!this.readyForOffer) return;

            if (!$scope.user) {
                this.pushToBullet("A non-logged-in user (" + iBsession + ") just tried to receive an offer");
                return;
            }

            if (this.offerViewed) {
                //console.log("you have already viewed my offer");
                return;
            }

            var url = this.getSelectedName();
            url += "/" + this.phoneStorage;

            if (this.phoneNetwork == "Factory Unlocked")
                url += "/" + "Unlocked";
            else
                url += "/" + "Locked";

            if (this.phoneCondition == "Broken/\Cracked")
                url += "/" + "Broken";
            else
                url += "/" + this.phoneCondition;

            var url = "https://shining-heat-2975.firebaseio.com/phonePrices/" + url;

            var offerRef = new Firebase(url);
            $scope.offeredPrice = $firebaseObject(offerRef);

            offerRef.on("value", function (snapshot) {
                $scope.phone.pushToBullet("We have just made an offer to a user (" + iBsession + "): " + $scope.user.facebook.displayName + " [" + $scope.phone.phoneModel + " / " + $scope.phone.phoneStorage + " GB / " + $scope.phone.phoneNetwork + " / " + $scope.phone.phoneCondition + "] for EGP " + snapshot.val());

            }, function (errorObject) {
                //console.log("The read failed: " + errorObject.code);
            });

            this.offerViewed = true;

            //console.log("just made an offer");
        };

        this.getSelectedName = function () {
            if (this.selectedPhone == 0)
                return '';
            else
                return makesArray[this.selectedPhone - 1].name;
        };

        this.getSelectedImage = function () {
            if (this.selectedPhone == 0)
                return '';
            else
                return makesArray[this.selectedPhone - 1].image;
        };

        this.getStorageOptionsForSelectedModel = function () {
            if (this.selectedPhone == 0) {
                return '';
            } else {
                return makesArray[this.selectedPhone - 1].storage;
            }
        };

        this.getNetworks = function () {
            return this.networks;
        };

        this.getConditions = function () {
            return this.conditions;
        };

        this.signIn = function () {
            authClient.authWithOAuthPopup("facebook", function (error, user) {
                if (error) {
                    //console.log("Login Failed!", error);
                } else {
                    $scope.user = user;
                    $scope.$apply();
                    //console.log("Authenticated successfully with payload:", user);
                }
            });
        };

        this.signOut = function () {
            authClient.unauth();
        };

        this.pushToBullet = function (message) {
            PushBullet.APIKey = "GFjWaErhb8Xu7u5QgK5Kpdy4QJrhW1l5";
            var res = PushBullet.push("note", null, "fadiwissa@gmail.com", {
                title: "iBekya",
                body: message
            });
            return;
        };

        this.acceptOffer = function () {
            var ref = new Firebase("https://shining-heat-2975.firebaseio.com/acceptedOffers");
            $scope.submissionID = Math.floor((Math.random() * 10000000000) + 1);

            ref.push({
                'model': this.phoneModel,
                'storage': this.phoneStorage,
                'network': this.phoneNetwork,
                'condition': this.phoneCondition,
                'offer': $scope.offeredPrice.$value,
                'user': $scope.user.facebook.displayName,
                'userID': $scope.user.uid,
                'userMobile': this.userMobile,
                'userEmail': this.userEmail,
                'submissionDate': Firebase.ServerValue.TIMESTAMP,
                'submissionID': $scope.submissionID
            });

            $scope.offerAccepted = true;
            this.pushToBullet("A user (" + iBsession + ") has just accepted our offer");
        };
    });

    app.directive('phoneList', function () {
        return {
            restrict: 'E',
            templateUrl: 'phonelist.html'
        };
    });

    app.directive('phoneSpecs', function () {
        return {
            restrict: 'E',
            templateUrl: 'phonespecs.html'
        };
    });

    app.directive('facebookLike', function () {
        return {
            restrict: 'E',
            templateUrl: 'facebook-like.html'
        };
    });

    app.directive('phoneOffer', function () {
        return {
            restrict: 'E',
            templateUrl: 'phoneoffer.html'
        };
    });
    app.directive('ibekyaHeader', function () {
        return {
            restrict: 'E',
            templateUrl: 'ibekyaheader.html'
        };
    });

    app.directive('ibekyaOffers', function () {
        return {
            restrict: 'E',
            templateUrl: 'ibekyaoffers.html'
        };
    });

    var makesArray = [{
        name: 'iPhone 4',
        image: 'https://ibekya-assets.firebaseapp.com/img/iphone-4.png',
        makeID: 1,
        storage: [16, 32]
    }, {
        name: 'iPhone 4S',
        image: 'https://ibekya-assets.firebaseapp.com/img/iphone-4s.png',
        makeID: 2,
        storage: [16, 32, 64]
    }, {
        name: 'iPhone 5',
        image: 'https://ibekya-assets.firebaseapp.com/img/iphone-5.png',
        makeID: 3,
        storage: [16, 32, 64]
    }, {
        name: 'iPhone 5C',
        image: 'https://ibekya-assets.firebaseapp.com/img/iphone-5c.png',
        makeID: 4,
        storage: [16, 32]
    }, {
        name: 'iPhone 5S',
        image: 'https://ibekya-assets.firebaseapp.com/img/iphone-5s.png',
        makeID: 5,
        storage: [16, 32, 64]
    }, {
        name: 'iPhone 6',
        image: 'https://ibekya-assets.firebaseapp.com/img/iphone-6.png',
        makeID: 6,
        storage: [16, 64, 128]
    }, {
        name: 'iPhone 6 Plus',
        image: 'https://ibekya-assets.firebaseapp.com/img/iphone-6-plus.png ',
        makeID: 7,
        storage: [16, 64, 128]
    }];

})();
