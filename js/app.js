(function() {
    var app = angular.module("phoneStore", ["firebase"]);

    app.controller('phoneController', function($scope, $firebaseArray, $firebaseObject) {
        var myRef = new Firebase("https://shining-heat-2975.firebaseio.com");
        var authClient = new FirebaseSimpleLogin(myRef, function(error, user) {
            if (error) {
                // an error occurred while attempting login
                console.log(error);
            } else if (user) {
                // user authenticated with Firebase
                $scope.user = user;
                $scope.$apply();
            } else {
                // user is logged out
                $scope.user = null;
                $scope.$apply();
            }
        });

        var offersRef = new Firebase("https://shining-heat-2975.firebaseio.com/acceptedOffers");
        var offersSync = $firebaseArray(offersRef);

        /*
        var pricesRef = new Firebase("https://shining-heat-2975.firebaseio.com/phonePrices");
        pricesRef.child('iPhone 4').set(iPhone4PricesArray);
        pricesRef.child('iPhone 4S').set(iPhone4SPricesArray);
        pricesRef.child('iPhone 5').set(iPhone5PricesArray);
        pricesRef.child('iPhone 5S').set(iPhone5SPricesArray);
        pricesRef.child('iPhone 5C').set(iPhone5CPricesArray);
        pricesRef.child('iPhone 6').set(iPhone6PricesArray);
        pricesRef.child('iPhone 6 Plus').set(iPhone6PlusPricesArray);
        */

        this.phones = makesArray;

        this.conditionDescription = '';
        this.selectedCondition = '';

        //Add a note that we do NOT accept jail-broken phones or those locked to any other network
        this.networks = ['Mobinil', 'Vodafone', 'Etisalat', 'Factory Unlocked'];
        this.conditions = ['Broken/\Cracked', 'Good', 'Flawless'];

        this.selectedPhone = 0;

        this.offerPrice = 0;

        this.readyForOffer = false;

        this.selectPhone = function(selection, selectedModel) {
            //Dummy function for now
            this.selectedPhone = selection;
            this.phoneModel = selectedModel;
        };

        this.validateInput = function() {
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

        this.getPhoneOffer = function() {
            this.readyForOffer = true;
            this.getOfferPrice();
        };

        this.backToSpecs = function() {
            this.offerPrice = 0;
            this.readyForOffer = false;
            $scope.offerAccepted = false;
        }

        this.restartSelection = function() {
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
        };

        this.isSelected = function(checkPhone) {
            return checkPhone == this.phone;
        };

        this.getOfferPrice = function() {
            if (!this.readyForOffer) return;

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
        };

        this.getSelectedName = function() {
            if (this.selectedPhone == 0)
                return '';
            else
                return makesArray[this.selectedPhone - 1].name;
        };

        this.getSelectedImage = function() {
            if (this.selectedPhone == 0)
                return '';
            else
                return makesArray[this.selectedPhone - 1].image;
        };

        this.getSelectedStorage = function() {
            if (this.selectedPhone == 0)
                return '';
            else
                return makesArray[this.selectedPhone - 1].storage;
        };

        this.getNetworks = function() {
            return this.networks;
        };

        this.getConditions = function() {
            return this.conditions;
        };

        this.signIn = function() {
            authClient.login("facebook");
        };

        this.signOut = function() {
            authClient.logout();
        };

        this.acceptOffer = function() {
            var ref = new Firebase("https://shining-heat-2975.firebaseio.com/acceptedOffers");
            var sync = $firebaseArray(ref);

            sync.$push({
                'model': this.phoneModel,
                'storage': this.phoneStorage,
                'network': this.phoneNetwork,
                'condition': this.phoneCondition,
                'offer': $scope.offeredPrice.$value,
                'user': $scope.user.displayName,
                'userID': $scope.user.uid,
                'userMobile': this.userMobile,
                'userEmail': this.userEmail,
                'submissionDate': Firebase.ServerValue.TIMESTAMP
            });

            $scope.offerAccepted = true;
        };
    });

    app.directive('phoneList', function() {
        return {
            restrict: 'E',
            templateUrl: 'phonelist.html'
        };
    });

    app.directive('phoneSpecs', function() {
        return {
            restrict: 'E',
            templateUrl: 'phonespecs.html'
        };
    });

    app.directive('phoneOffer', function() {
        return {
            restrict: 'E',
            templateUrl: 'phoneoffer.html'
        };
    });
    app.directive('ibekyaHeader', function() {
        return {
            restrict: 'E',
            templateUrl: 'ibekyaheader.html'
        };
    });

    app.directive('ibekyaOffers', function() {
        return {
            restrict: 'E',
            templateUrl: 'ibekyaoffers.html'
        };
    });

    var makesArray = [{
        name: 'iPhone 4',
        image: 'img/iphone-4.jpg',
        makeID: 1,
        storage: [16, 32]
    }, {
        name: 'iPhone 4S',
        image: 'img/iphone-4s.jpg',
        makeID: 2,
        storage: [16, 32, 64]
    }, {
        name: 'iPhone 5',
        image: 'img/iphone-5.jpg',
        makeID: 3,
        storage: [16, 32, 64]
    }, {
        name: 'iPhone 5C',
        image: 'img/iphone-5c.jpg',
        makeID: 4,
        storage: [16, 32]
    }, {
        name: 'iPhone 5S',
        image: 'img/iphone-5s.jpg',
        makeID: 5,
        storage: [16, 32, 64]
    }, {
        name: 'iPhone 6',
        image: 'img/iphone-6.jpg',
        makeID: 6,
        storage: [16, 64, 128]
    }, {
        name: 'iPhone 6 Plus',
        image: 'img/iphone-6-plus.jpg ',
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