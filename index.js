var HA = require('hyperapp')
var S = require('pull-stream/pull')
var Map = require('pull-stream/throughs/map')
var Drain = require('pull-stream/sinks/drain')
var xtend = require('xtend')
var Notify = require('pull-notify')
var Many = require('pull-many')

var lifecycle = ['init', 'loaded', 'render']

function toStream (opts) {
    function source () {
        return Many(Object.keys(source).map(function (k) {
            return S(
                source[k].listen(),
                Map(function (ev) { return [k, ev] })
            )
        }))
    }

    var sources = opts.actions.reduce(function (acc, name) {
        acc[name] = Notify()
        return acc
    }, {})

    Object.keys(sources).forEach(function (k) {
        source[k] = sources[k].listen
    })

    lifecycle.forEach(function (ev) {
        var n = Notify()
        source[ev] = n.listen
    })

    var actions = opts.actions.reduce(function (acc, name) {
        acc[name] = function (state, actions, ev) {
            sources[name](ev)
        }
        return acc
    }, {})

    actions._update = function (state, actions, ev) {
        return ev
    }

    var _events = lifecycle.reduce(function (acc, k) {
        acc[k] = function (state) {
            source[k](state)
        }
        return acc
    }, {})

    _events._update = function (state, actions, ev) {
        actions._update(ev)
    }

    var emit = HA.app(xtend(opts, {
        actions: actions,
        events: _events
    }))

    var sink = Drain(function onStateChange (state) {
        emit('_update', state)
    }, function onEnd (err) {
        console.log('stream end', err)
    })

    return {
        source: source,
        sink: sink
    }
}

module.exports = toStream

