(function () {
    var app = angular.module("phoneStore", ["firebase"]);

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
        this.conditions = ['Broken/\Cracked', 'Good', 'Flawless'];

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

        this.getSelectedStorage = function () {
            if (this.selectedPhone == 0)
                return '';
            else
                return makesArray[this.selectedPhone - 1].storage;
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
        image: 'https://ibekya-assets.firebaseapp.com/img/iphone-4.jpg',
        makeID: 1,
        storage: [16, 32]
    }, {
        name: 'iPhone 4S',
        image: 'https://ibekya-assets.firebaseapp.com/img/iphone-4s.jpg',
        makeID: 2,
        storage: [16, 32, 64]
    }, {
        name: 'iPhone 5',
        image: 'https://ibekya-assets.firebaseapp.com/img/iphone-5.jpg',
        makeID: 3,
        storage: [16, 32, 64]
    }, {
        name: 'iPhone 5C',
        image: 'https://ibekya-assets.firebaseapp.com/img/iphone-5c.jpg',
        makeID: 4,
        storage: [16, 32]
    }, {
        name: 'iPhone 5S',
        image: 'https://ibekya-assets.firebaseapp.com/img/iphone-5s.jpg',
        makeID: 5,
        storage: [16, 32, 64]
    }, {
        name: 'iPhone 6',
        image: 'https://ibekya-assets.firebaseapp.com/img/iphone-6.jpg',
        makeID: 6,
        storage: [16, 64, 128]
    }, {
        name: 'iPhone 6 Plus',
        image: 'https://ibekya-assets.firebaseapp.com/img/iphone-6-plus.jpg ',
        makeID: 7,
        storage: [16, 64, 128]
    }];

    var iPhone4PricesArray = {
        '16': {
            'Locked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            },
            'Unlocked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            }
        },
        '32': {
            'Locked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            },
            'Unlocked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            }
        }
    };

    var iPhone4SPricesArray = {
        '16': {
            'Locked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            },
            'Unlocked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            }
        },
        '32': {
            'Locked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            },
            'Unlocked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            }
        },
        '64': {
            'Locked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            },
            'Unlocked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            }
        },
    };

    var iPhone5PricesArray = {
        '16': {
            'Locked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            },
            'Unlocked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            }
        },
        '32': {
            'Locked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            },
            'Unlocked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            }
        },
        '64': {
            'Locked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            },
            'Unlocked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            }
        },
    };

    var iPhone5CPricesArray = {
        '16': {
            'Locked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            },
            'Unlocked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            }
        },
        '32': {
            'Locked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            },
            'Unlocked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            }
        }
    };

    var iPhone5SPricesArray = {
        '16': {
            'Locked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            },
            'Unlocked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            }
        },
        '32': {
            'Locked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            },
            'Unlocked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            }
        },
        '64': {
            'Locked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            },
            'Unlocked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            }
        },
    };

    var iPhone6PricesArray = {
        '16': {
            'Locked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            },
            'Unlocked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            }
        },
        '64': {
            'Locked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            },
            'Unlocked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            }
        },
        '128': {
            'Locked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            },
            'Unlocked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            }
        },
    };

    var iPhone6PlusPricesArray = {
        '16': {
            'Locked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            },
            'Unlocked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            }
        },
        '64': {
            'Locked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            },
            'Unlocked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            }
        },
        '128': {
            'Locked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            },
            'Unlocked': {
                'Flawless': 500,
                'Good': 400,
                'Broken': 200
            }
        },
    };
})();
