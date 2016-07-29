// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
// Noodlio Pay

// These are fixed values, do not change this
var NOODLIO_PAY_API_URL         = "https://noodlio-pay.p.mashape.com";
var NOODLIO_PAY_API_KEY         = "7AGaQ6bSEBmshcxhK2TZ6LZjpfGQp1HBnE9jsniWnxvyS1V6RY";
var NOODLIO_PAY_CHECKOUT_KEY    = {test: "pk_test_QGTo45DJY5kKmsX21RB3Lwvn", live: "pk_live_ZjOCjtf1KBlSHSyjKDDmOGGE"};
// Obtain your unique Stripe Account Id from here:
// https://www.noodl.io/pay/connect
var STRIPE_ACCOUNT_ID           = "acct_18YHIhGRav2dwZ3J";

// Define whether you are in development mode (TEST_MODE: true) or production mode (TEST_MODE: false)
var TEST_MODE = false;

angular.module('messageQA', ['ionic', 'messageQA.controllers', 'messageQA.services', 'angularMoment', 'stripe.checkout'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, StripeCheckoutProvider) {
  switch (TEST_MODE) {
    case true:
      //
      StripeCheckoutProvider.defaults({key: NOODLIO_PAY_CHECKOUT_KEY['test']});
      break
    default:
      //
      StripeCheckoutProvider.defaults({key: NOODLIO_PAY_CHECKOUT_KEY['live']});
      break
  };

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  .state('auth', {
    url: "/auth",
    abstract: true,
    templateUrl: "templates/auth.html"
  })
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })
  .state('auth.login', {
    url: '/login',
    views: {
      'auth-login': {
        templateUrl: 'templates/auth-login.html',
        controller: 'LoginController'
      }
    }
  })
  .state('auth.signup', {
    url: '/signup',
    views: {
      'auth-signup': {
        templateUrl: 'templates/auth-signup.html',
        controller: 'SignUpController'
      }
    }
  })
  .state('tab.myquestions', {
      url: '/myquestions',
      views: {
        'tab-myquestions': {
          templateUrl: 'templates/tab-myquestions.html',
          controller: 'MyQuestionsController'
        }
      }
    })
    .state('tab.questions', {
        url: '/questions',
        views: {
          'tab-questions': {
            templateUrl: 'templates/tab-questions.html',
            controller: 'PopularQuestionsController'
          }
        }
      })
    // .state('tab.question-detail', {
    //   url: '/questions/:questionId',
    //   views: {
    //     'tab-questions': {
    //       templateUrl: 'templates/question-detail.html',
    //       controller: 'QuestionDetailController'
    //     }
    //   }
    // })
    .state('tab.find', {
        url: '/find',
        views: {
          'tab-find': {
            templateUrl: 'templates/tab-find.html',
            controller: 'FindController',
            resolve: {
              // checkout.js isn't fetched until this is resolved.
              stripe: StripeCheckoutProvider.load
            }
          }
        }
      })
    .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountController'
      }
    }
  });


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/auth/login');

});
