angular.module('messageQA.services', [])

.factory('API', function ($rootScope, $http, $ionicLoading, $ionicPopup, $window) {
       var base = "https://messageqaappserver.herokuapp.com";
        $rootScope.show = function (text) {
            $ionicLoading.show({
              template: text
            }).then(function(){
            });
        };
        $rootScope.showAlert = function(text) {
          var alertPopup = $ionicPopup.alert({
            title: 'Alert!',
            template: text
          });

          alertPopup.then(function(res) {
          });
        };

        $rootScope.hide = function () {
            $ionicLoading.hide();
        };

        $rootScope.logout = function () {
            $rootScope.setToken("");
            $rootScope.setTherapistToken("");
            $rootScope.setTherapistID("");
            $window.location.href = '#/auth/signin';
        };

        $rootScope.notify =function(text){
            $rootScope.show(text);
            $window.setTimeout(function () {
              $rootScope.hide();
            }, 1999);
        };

        $rootScope.doRefresh = function (tab) {
            if(tab == 3){
                $rootScope.$broadcast('fetchAll');
            } else if(tab == 2){
              $rootScope.$broadcast('fetchAllTherapists');
            } else if(tab == 1){
              $rootScope.$broadcast('fetchAllQs');
            }
            $rootScope.$broadcast('scroll.refreshComplete');
        };

        $rootScope.setToken = function (token) {
            return $window.localStorage.token = token;
        }

        $rootScope.getToken = function () {
            return $window.localStorage.token;
        }

        $rootScope.isSessionActive = function () {
            return $window.localStorage.token ? true : false;
        }
        $rootScope.setTherapistToken = function (token) {
            return $window.localStorage.therapisttoken = token;
        }
        $rootScope.setTherapistID = function (token) {
            return $window.localStorage.therapistid = token;
        }
        $rootScope.getTherapistID = function () {
            return $window.localStorage.therapistid;
        }

        $rootScope.getTherapistToken = function () {
            return $window.localStorage.therapisttoken;
        }

        $rootScope.isTherapistSessionActive = function () {
            return $window.localStorage.therapisttoken ? true : false;
        }

        return {
            signin: function (form) {
                return $http.post(base+'/api/v1/messageqa/auth/login', form);
            },
            therapistsignin: function (form) {
                return $http.post(base+'/api/v1/messageqa/therapistauth/login', form);
            },
            signup: function (form) {
                return $http.post(base+'/api/v1/messageqa/auth/register', form);
            },
            getAll: function (email) {
                return $http.get(base+'/api/v1/messageqa/data/list', {
                    method: 'GET',
                    params: {
                        token: email
                    }
                });
            },
            getTherapistAll: function (id) {
                return $http.get(base+'/api/v1/messageqa/data/therapistquestionlist', {
                    method: 'GET',
                    params: {
                        token: id
                    }
                });
            },
            findAll: function (email) {
                return $http.get(base+'/api/v1/messageqa/data/listall', {
                    method: 'GET',
                    params: {
                        token: email
                    }
                });
            },
            getOne: function (id, email) {
                return $http.get(base+'/api/v1/messageqa/data/item/' + id, {
                    method: 'GET',
                    params: {
                        token: email
                    }
                });
            },
            saveItem: function (form, email) {
                return $http.post(base+'/api/v1/messageqa/data/item', form, {
                    method: 'POST',
                    params: {
                        token: email
                    }
                });
            },
            putItem: function (id, form, email) {
                return $http.put(base+'/api/v1/messageqa/data/item/' + id, form, {
                    method: 'PUT',
                    params: {
                        token: email
                    }
                });
            },
            deleteItem: function (id, email) {
                return $http.delete(base+'/api/v1/messageqa/data/item/' + id, {
                    method: 'DELETE',
                    params: {
                        token: email
                    }
                });
            },
            getUser: function (email) {
                return $http.get(base+'/api/v1/messageqa/auth', {
                    method: 'GET',
                    params: {
                        token: email
                    }
                });
            }
        }
    })
    .factory('StripeCharge', function($q, $http, StripeCheckout) {
      var self = this;

      // add the following headers for authentication
      //$http.defaults.headers.common['X-Mashape-Key']  = NOODLIO_PAY_API_KEY;
      // $http.defaults.headers.common['Content-Type']   = 'application/json;charset=utf-8';
      // $http.defaults.headers.common['Accept']         = 'application/json, text/plain, */*';

      /**
       * Connects with the backend (server-side) to charge the customer
       *
       * # Note on the determination of the price
       * In this example we base the $stripeAmount on the object ProductMeta which has been
       * retrieved on the client-side. For safety reasons however, it is recommended to
       * retrieve the price from the back-end (thus the server-side). In this way the client
       * cannot write his own application and choose a price that he/she prefers
       */
      self.chargeUser = function(stripeToken, ProductMeta) {
        var qCharge = $q.defer();

        var chargeUrl = NOODLIO_PAY_API_URL + "/charge/token";

        var param = {
          source: stripeToken,
          amount: Math.floor(ProductMeta.price*100),
          currency: "usd",
          description: "Your custom description here",
          stripe_account: STRIPE_ACCOUNT_ID,
          test: TEST_MODE,
        };

        $http.post(NOODLIO_PAY_API_URL + "/charge/token", param, {
          headers: {
            "X-Mashape-Key": NOODLIO_PAY_API_KEY
          }
        })
        .success(
          function(StripeInvoiceData){
            qCharge.resolve(StripeInvoiceData);
            // you can store the StripeInvoiceData for your own administration
          }
        )
        .error(
          function(error){
            console.log(error)
            qCharge.reject(error);
          }
        );
        return qCharge.promise;
      };


      /**
       * Get a stripe token through the checkout handler
       */
      self.getStripeToken = function(ProductMeta) {
        var qToken = $q.defer();

        var handlerOptions = {
            name: ProductMeta.name,
            description: ProductMeta.intro,
            amount: Math.floor(ProductMeta.price*100),
        };

        var handler = StripeCheckout.configure({
            name: ProductMeta.name,
            token: function(token, args) {
              //console.log(token.id)
            }
        });

        handler.open(handlerOptions).then(
          function(result) {
            var stripeToken = result[0].id;
            if(stripeToken != undefined && stripeToken != null && stripeToken != "") {
                //console.log("handler success - defined")
                qToken.resolve(stripeToken);
            } else {
                //console.log("handler success - undefined")
                qToken.reject("ERROR_STRIPETOKEN_UNDEFINED");
            }
          }, function(error) {
            if(error == undefined) {
                qToken.reject("ERROR_CANCEL");
            } else {
                qToken.reject(error);
            }
          } // ./ error
        ); // ./ handler
        return qToken.promise;
  };


  return self;
})
.factory('Professionals', function() {
      // Might use a resource here that returns a JSON array


      // var professionals = [{
      //   id: 0,
      //   name: 'Aaron Munson',
      //   email: 'aaronmunsonlpc@gmail.com',
      //   price: 100,
      //   face: 'img/AaronMunson.jpg',
      //   intro: 'Aaron is a Licensed Professional Counselor who provides psychotherapy from a Cognitive Behavioral Therapy (CBT) and Solution Focused perspective. He also helps works with clients with depression, PTSD and eating disorders.'
      // }, {
      //   id: 1,
      //   name: 'Angela Ficken',
      //   email: 'angela@progresswellness.com',
      //   price: 100,
      //   face: 'img/AngelaFicken.jpg',
      //   intro: 'Angela Ficken, LICSW specializes in OCD, anxiety related concerns, and eating disorders. She is certified in CBT and DBT and trained in Exposure and Response Prevention. She has worked at McLean Hospital and Harvard University. She is now in full time private practice in Boston, MA.'
      // }, {
      //   id: 2,
      //   name: 'Gerald Tarlow',
      //   email: 'gtarlow@gmail.com',
      //   price: 20,
      //   face: 'img/GeraldTarlow.jpg',
      //   intro: 'Dr. Tarlow is the director of the Center for Anxiety Management. He has specialized in treating anxiety disorders for more than 30 years. He is a Clinical Professor in the Department of Psychiatry at UCLA.  Dr. Tarlow is board certified in cognitive and behavioral psychology by the American Board of Professional Psychology.'
      // }, {
      //   id: 3,
      //   name: 'Howard Weissman',
      //   email: 'drhweissman@aol.com',
      //   price: 100,
      //   face: 'img/HowardWeissman.jpg',
      //   intro: 'Dr. Howard K. Weissman is Clinical Director and Founder of The Chicago Stress Relief Center, Inc. (CSRC), a diversified holistic practice he began in 1993. He is a licensed Clinical Psychologist with a specialization in mind/body health and is a board-certified expert in the treatment of traumatic stress.'
      // }, {
      //   id: 4,
      //   name: 'Jane Bodine',
      //   email: 'janeoctric@yahoo.com',
      //   price: 100,
      //   face: 'img/JaneBodine.jpg',
      //   intro: 'Jane Bodine is a Licensed Clinical Professional Counselor (LCPC) who has been in private practice in Naperville starting her 26th year.'
      // }, {
      //   id: 5,
      //   name: 'Lynne Freeman',
      //   price: 100,
      //   face: 'img/LynneFreeman.jpg',
      //   intro: 'Lynne Freeman, PhD, LMFT, specializes in the treatment of anxiety disorders and related conditions. She is the author of Panic Free: Eliminate Anxiety and Panic Attacks Without Drugs and Take Control of Your Life. Dr. Freeman is a certified cognitive behavioral therapist and was the founder and executive director of Open Doors Institute of Los Angeles, a statewide network of anxiety specialists. She is now in private practice in Encino, California.'
      // }, {
      //   id: 6,
      //   name: 'Martin Seif',
      //   email: 'martinnseif@gmail.com',
      //   price: 100,
      //   face: 'img/MartinSeif.jpg',
      //   intro: 'Martin Seif, Ph.D., is a founder of the Anxiety & Depression Association of America and served on its Board of Directors and Clinical Advisory Board. He is Associate Director of the Anxiety & Phobia Treatment Center of White Plains Hospital, faculty of New York-Presbyterian Hospital, Board Certified in Cognitive Behavioral Therapy by the American Board of Professional Psychology, creator of Freedom to Fly for fearful fliers.'
      // }, {
      //   id: 7,
      //   name: 'Michele Kaczmarek',
      //   email: 'resolutionsnj@icloud.com',
      //   price: 100,
      //   face: 'img/MicheleKaczmarek.jpg',
      //   intro: 'Michele Kaczmarek is Licensed Professional Counselor and has been providing mental health treatment services for 25 years in a variety of settings, treating different age groups with diverse needs. Currently, she provides treatment in her private practice and specializes in treating children, adolescents, and adults with anxiety, OCD, and related disorders.'
      // }, {
      //   id: 8,
      //   name: 'Robin Kirk',
      //   email: 'robin@sagepsychotherapy.org',
      //   price: 100,
      //   face: 'img/RobinKirk.jpg',
      //   intro: 'Robin Taylor Kirk, LMFT pioneered the use of ACT-Based Exposure in an Intensive Outpatient Program setting.  Ms. Kirk has been in the mental health field for over 20 years and specializes in the treatment of Anxiety Disorders.  Robin co-owned Summit Eating Disorders Program (now Eating Recovery Center of California).  Many of her clients also suffered from an Anxiety Disorder and she became interested in the treatment of anxiety and OCD.'
      // }, {
      //   id: 9,
      //   name: 'Ronit Levy',
      //   email: 'drLevy@buckscountyanxietycenter.com',
      //   price: 100,
      //   face: 'img/RonitLevy.png',
      //   intro: 'Dr. Ronit Levy is a licensed psychologist practicing in Newtown, PA.  Dr. Levy completed her M.A. and Doctorate at Yeshiva University. She dual specialized in Cognitive Behavioral Therapy for anxiety disorders and neuropsychology. She trained at the Center for Cognitive Behavioral Psychotherapy and completed her internship and post doctoral fellowship at NYU Langone Medical Center.'
      // }, {
      //   id: 10,
      //   name: 'Sarah Tippit',
      //   email: 'sarahtippit@san.rr.com',
      //   price: 100,
      //   face: 'img/SarahTippit.jpg',
      //   intro: 'Sarah Tippit treats OCD clients of all ages under the clinical supervision of one of Southern California’s leading OCD specialists, Lori Riddle-Walker, LMFT, EdD. Sarah received her MA in Marital and Family Therapy with an emphasis on Clinical Art Therapy from Loyola Marymount University. In addition to private practice her other experience includes working in hospitals, acute care crisis centers and hospices. She is a member of CAMFT and the International OCD Foundation (IOCDF).'
      // }, {
      //   id: 11,
      //   name: 'Tamar Gordon',
      //   email: 'drgordon@tamargordonpsychology.com',
      //   price: 100,
      //   face: 'img/TamarGordon.jpg',
      //   intro: 'Dr. Tamar Gordon is a licensed clinical psychologist with extensive training in using CBT to treat a full range of mental health challenges, including anxiety, phobias, depression, OCD, trauma, parenting issues, and insomnia. She received her B.A. from Harvard University, and her M.A. and Ph.D. from St. John’s University.'
      // }, {
      //   id: 12,
      //   name: 'The Center for Anxiety',
      //   email: 'tnioplias@centerforanxiety.org',
      //   price: 100,
      //   face: 'img/centerforanxiety.png',
      //   intro: 'The Center for Anxiety provides evidence-based culturally-sensitive treatments to adults, adolescents and children. Each member of our clinical staff is exceptionally trained in the application of Cognitive Behavioral Therapy for anxiety and obsessive-compulsive symptoms.'
      // }]
      var professionals = [{
        id: 2,
        name: 'Gerald Tarlow',
        email: 'gtarlow@gmail.com',
        price: 20,
        face: 'img/GeraldTarlow.jpg',
        intro: 'Dr. Tarlow is the director of the Center for Anxiety Management. He has specialized in treating anxiety disorders for more than 30 years. He is a Clinical Professor in the Department of Psychiatry at UCLA.  Dr. Tarlow is board certified in cognitive and behavioral psychology by the American Board of Professional Psychology.'
      }, {
        id: 5,
        name: 'Lynne Freeman',
        price: 40,
        face: 'img/LynneFreeman.jpg',
        intro: 'Lynne Freeman, PhD, LMFT, specializes in the treatment of anxiety disorders and related conditions. She is the author of Panic Free: Eliminate Anxiety and Panic Attacks Without Drugs and Take Control of Your Life. Dr. Freeman is a certified cognitive behavioral therapist and was the founder and executive director of Open Doors Institute of Los Angeles, a statewide network of anxiety specialists. She is now in private practice in Encino, California.'
      }]

      return {
        all: function() {
          return professionals;
        },
        remove: function(professional) {
          professionals.splice(professionals.indexOf(professional), 1);
        },
        get: function(professionalId) {
          for (var i = 0; i < professionals.length; i++) {
            if (professionals[i].id === parseInt(professionalId)) {
              return professionals[i];
            }
          }
          return null
        }
      }
    })

    .factory('Advocates', function() {
          // Might use a resource here that returns a JSON array


          // var professionals = [{
          //   id: 0,
          //   name: 'Aaron Munson',
          //   email: 'aaronmunsonlpc@gmail.com',
          //   price: 100,
          //   face: 'img/AaronMunson.jpg',
          //   intro: 'Aaron is a Licensed Professional Counselor who provides psychotherapy from a Cognitive Behavioral Therapy (CBT) and Solution Focused perspective. He also helps works with clients with depression, PTSD and eating disorders.'
          // }, {
          //   id: 1,
          //   name: 'Angela Ficken',
          //   email: 'angela@progresswellness.com',
          //   price: 100,
          //   face: 'img/AngelaFicken.jpg',
          //   intro: 'Angela Ficken, LICSW specializes in OCD, anxiety related concerns, and eating disorders. She is certified in CBT and DBT and trained in Exposure and Response Prevention. She has worked at McLean Hospital and Harvard University. She is now in full time private practice in Boston, MA.'
          // }, {
          //   id: 2,
          //   name: 'Gerald Tarlow',
          //   email: 'gtarlow@gmail.com',
          //   price: 20,
          //   face: 'img/GeraldTarlow.jpg',
          //   intro: 'Dr. Tarlow is the director of the Center for Anxiety Management. He has specialized in treating anxiety disorders for more than 30 years. He is a Clinical Professor in the Department of Psychiatry at UCLA.  Dr. Tarlow is board certified in cognitive and behavioral psychology by the American Board of Professional Psychology.'
          // }, {
          //   id: 3,
          //   name: 'Howard Weissman',
          //   email: 'drhweissman@aol.com',
          //   price: 100,
          //   face: 'img/HowardWeissman.jpg',
          //   intro: 'Dr. Howard K. Weissman is Clinical Director and Founder of The Chicago Stress Relief Center, Inc. (CSRC), a diversified holistic practice he began in 1993. He is a licensed Clinical Psychologist with a specialization in mind/body health and is a board-certified expert in the treatment of traumatic stress.'
          // }, {
          //   id: 4,
          //   name: 'Jane Bodine',
          //   email: 'janeoctric@yahoo.com',
          //   price: 100,
          //   face: 'img/JaneBodine.jpg',
          //   intro: 'Jane Bodine is a Licensed Clinical Professional Counselor (LCPC) who has been in private practice in Naperville starting her 26th year.'
          // }, {
          //   id: 5,
          //   name: 'Lynne Freeman',
          //   price: 100,
          //   face: 'img/LynneFreeman.jpg',
          //   intro: 'Lynne Freeman, PhD, LMFT, specializes in the treatment of anxiety disorders and related conditions. She is the author of Panic Free: Eliminate Anxiety and Panic Attacks Without Drugs and Take Control of Your Life. Dr. Freeman is a certified cognitive behavioral therapist and was the founder and executive director of Open Doors Institute of Los Angeles, a statewide network of anxiety specialists. She is now in private practice in Encino, California.'
          // }, {
          //   id: 6,
          //   name: 'Martin Seif',
          //   email: 'martinnseif@gmail.com',
          //   price: 100,
          //   face: 'img/MartinSeif.jpg',
          //   intro: 'Martin Seif, Ph.D., is a founder of the Anxiety & Depression Association of America and served on its Board of Directors and Clinical Advisory Board. He is Associate Director of the Anxiety & Phobia Treatment Center of White Plains Hospital, faculty of New York-Presbyterian Hospital, Board Certified in Cognitive Behavioral Therapy by the American Board of Professional Psychology, creator of Freedom to Fly for fearful fliers.'
          // }, {
          //   id: 7,
          //   name: 'Michele Kaczmarek',
          //   email: 'resolutionsnj@icloud.com',
          //   price: 100,
          //   face: 'img/MicheleKaczmarek.jpg',
          //   intro: 'Michele Kaczmarek is Licensed Professional Counselor and has been providing mental health treatment services for 25 years in a variety of settings, treating different age groups with diverse needs. Currently, she provides treatment in her private practice and specializes in treating children, adolescents, and adults with anxiety, OCD, and related disorders.'
          // }, {
          //   id: 8,
          //   name: 'Robin Kirk',
          //   email: 'robin@sagepsychotherapy.org',
          //   price: 100,
          //   face: 'img/RobinKirk.jpg',
          //   intro: 'Robin Taylor Kirk, LMFT pioneered the use of ACT-Based Exposure in an Intensive Outpatient Program setting.  Ms. Kirk has been in the mental health field for over 20 years and specializes in the treatment of Anxiety Disorders.  Robin co-owned Summit Eating Disorders Program (now Eating Recovery Center of California).  Many of her clients also suffered from an Anxiety Disorder and she became interested in the treatment of anxiety and OCD.'
          // }, {
          //   id: 9,
          //   name: 'Ronit Levy',
          //   email: 'drLevy@buckscountyanxietycenter.com',
          //   price: 100,
          //   face: 'img/RonitLevy.png',
          //   intro: 'Dr. Ronit Levy is a licensed psychologist practicing in Newtown, PA.  Dr. Levy completed her M.A. and Doctorate at Yeshiva University. She dual specialized in Cognitive Behavioral Therapy for anxiety disorders and neuropsychology. She trained at the Center for Cognitive Behavioral Psychotherapy and completed her internship and post doctoral fellowship at NYU Langone Medical Center.'
          // }, {
          //   id: 10,
          //   name: 'Sarah Tippit',
          //   email: 'sarahtippit@san.rr.com',
          //   price: 100,
          //   face: 'img/SarahTippit.jpg',
          //   intro: 'Sarah Tippit treats OCD clients of all ages under the clinical supervision of one of Southern California’s leading OCD specialists, Lori Riddle-Walker, LMFT, EdD. Sarah received her MA in Marital and Family Therapy with an emphasis on Clinical Art Therapy from Loyola Marymount University. In addition to private practice her other experience includes working in hospitals, acute care crisis centers and hospices. She is a member of CAMFT and the International OCD Foundation (IOCDF).'
          // }, {
          //   id: 11,
          //   name: 'Tamar Gordon',
          //   email: 'drgordon@tamargordonpsychology.com',
          //   price: 100,
          //   face: 'img/TamarGordon.jpg',
          //   intro: 'Dr. Tamar Gordon is a licensed clinical psychologist with extensive training in using CBT to treat a full range of mental health challenges, including anxiety, phobias, depression, OCD, trauma, parenting issues, and insomnia. She received her B.A. from Harvard University, and her M.A. and Ph.D. from St. John’s University.'
          // }, {
          //   id: 12,
          //   name: 'The Center for Anxiety',
          //   email: 'tnioplias@centerforanxiety.org',
          //   price: 100,
          //   face: 'img/centerforanxiety.png',
          //   intro: 'The Center for Anxiety provides evidence-based culturally-sensitive treatments to adults, adolescents and children. Each member of our clinical staff is exceptionally trained in the application of Cognitive Behavioral Therapy for anxiety and obsessive-compulsive symptoms.'
          // }]
          var advocates = [{
            id: 101,
            name: 'Epifania Rita Gallina',
            email: '',
            price: 0,
            face: 'img/Epi.jpg',
            intro: "My name is Epifania Rita Gallina and I am a 24 year old college student majoring in psychology and minoring in creative writing at Hunter College in New York City. I will graduate this May with a Bachelor's of Arts in Psychology. My future goal is to be a clinical psychologist specialized in OCD and anxiety disorders, a clinical neuropsychologist, and cognitive neuroscientist. I have suffered from OCD for six years and been in remission for almost three. In september of 2015, I created the online private facebook support group called \"Living on Edge: Taking back of Your life through Erp,\" which now holds 88 members. In addition, I co-administrate \"OCD Acceptance,\" an online ocd platform created by my friend Bowen Zheng. My hobbies are reading, writing, listening to pop music, and watching Gilmore Girls. I live in New York with my husband and family."
          }]

          return {
            all: function() {
              return advocates;
            },
            remove: function(advocate) {
              advocates.splice(advocates.indexOf(advocate), 1);
            },
            get: function(advocateId) {
              for (var i = 0; i < advocates.length; i++) {
                if (advocates[i].id === parseInt(advocateId)) {
                  return advocates[i];
                }
              }
              return null
            }
          }
        })
