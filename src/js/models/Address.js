var ko = require('knockout')
var _ = require('lodash')
var ajax = require('basic-ajax')
var endpoints = require('../api-endpoints')
var getUrlParameter = require('../get-url-parameter')
var cookies = require('../cookies')

function OpeningTime (data) {
  var self = this
  self.days = ko.observableArray(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
  self.day = ko.observable(data.day)
  self.startTime = ko.observable(data.startTime)
  self.endTime = ko.observable(data.endTime)
}

function Address (data) {
  var self = this

  self.key = data.key
  self.savedStreet1 = ko.observable(data.street)
  self.savedStreet2 = ko.observable(data.street1)
  self.savedStreet3 = ko.observable(data.street2)
  self.savedStreet4 = ko.observable(data.street3)
  self.savedCity = ko.observable(data.city)
  self.savedPostcode = ko.observable(data.postcode)

  self.street1 = ko.observable(data.street)
  self.street2 = ko.observable(data.street1)
  self.street3 = ko.observable(data.street2)
  self.street4 = ko.observable(data.street3)
  self.city = ko.observable(data.city)
  self.postcode = ko.observable(data.postcode)

  self.savedOpeningTimes = ko.observableArray(_.map(data.openingTimes, function (time) {
    return new OpeningTime(time)
  }))

  self.openingTimes = ko.observableArray(_.map(data.openingTimes, function (time) {
    return new OpeningTime(time)
  }))

  self.isEditing = ko.observable(false)
  self.message = ko.observable()
  self.listeners = ko.observableArray()

  self.edit = function () {
    self.isEditing(true)
  }

  self.cancel = function () {
    self.restoreFields()
    _.forEach(self.listeners(), function(listener) {
      listener.cancelAddress(self)
    })
  }

  self.newOpeningTime = function () {
    var openingTimes = self.openingTimes()
    openingTimes.push(new OpeningTime({
      'day': '',
      'startTime': '',
      'endTime': ''
    }))
    self.openingTimes(openingTimes)
  }

  self.removeOpeningTime = function (openingTimeToRemove) {
    var remaining = _.filter(self.openingTimes(), function(o) {
      return o.day() !== openingTimeToRemove.day()
          || o.startTime() !== openingTimeToRemove.startTime()
          || o.endTime() !== openingTimeToRemove.endTime()
    })

    self.openingTimes(remaining)
  }

  self.save = function () {
    ajax.put(endpoints.serviceProviderAddresses + '/' + getUrlParameter.parameter('key') + '/update/' + self.key,
      {
        'content-type': 'application/json',
        'session-token': cookies.get('session-token')
      },
      JSON.stringify({
        'Street': self.street1(),
        'Street1': self.street2(),
        'Street2': self.street3(),
        'Street3': self.street4(),
        'City': self.city(),
        'Postcode': self.postcode(),
        'OpeningTimes': _.map(self.openingTimes(), function(openingTime) {
          return {
            'startTime': openingTime.startTime(),
            'endTime': openingTime.endTime(),
            'day': openingTime.day()
          }
        })
      })
      ).then(function (result) {
        self.isEditing(false)
        self.setFields()
      }, function (error) {
        var response = JSON.parse(error.response)
        self.message(response.messages.join('<br />'))
      })
  }

  self.restoreFields = function () {
    self.isEditing(false)
    self.street1(self.savedStreet1())
    self.street2(self.savedStreet2())
    self.street3(self.savedStreet3())
    self.street4(self.savedStreet4())
    self.city(self.savedCity())
    self.postcode(self.savedPostcode())

    var restoredOpeningTimes = _.map(self.savedOpeningTimes(), function(ot) {
      return new OpeningTime({
        'day': ot.day(),
        'startTime': ot.startTime(),
        'endTime': ot.endTime(),
      })
    })

    self.openingTimes(restoredOpeningTimes)
  }

  self.setFields = function () {
    self.savedStreet1(self.street1())
    self.savedStreet2(self.street2())
    self.savedStreet3(self.street3())
    self.savedStreet4(self.street4())
    self.savedCity(self.city())
    self.savedPostcode(self.postcode())
  }

  self.addListener = function (listener) {
    self.listeners().push(listener)
  }
}

module.exports = Address
