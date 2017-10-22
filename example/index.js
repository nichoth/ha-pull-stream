var h = require('hyperapp').h
var S = require('pull-stream')
var toStream = require('../')

var initState = { hello: 'world' }

var view = toStream({
    root: document.body,
    state: initState,
    actions: ['foo', 'bar'],
    view: function (state, send) {
        console.log('in here', state, send)
        return h('div', {}, [
            'hello ' + state.hello,
            h('br'),
            h('input', { type: 'text', value: state.hello,
                oninput: send.foo })
        ])
    }
})

S(
    view.source.foo(),
    S.map(ev => ({ hello: ev.target.value })),
    view.sink
)

