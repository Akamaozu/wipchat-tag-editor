// create interface for managing wip.chat todo items

// #1 create a window when script is launched
  var launch_icon_html = '<style>'
                          + '#wipchat-tageditor-ui {'
                            + 'position: fixed;'
                            + 'bottom: 3.5%;'
                            + 'right: 3.5%;'
                            + 'padding: .25em;'
                            + 'transition: all .15s ease-in;'
                            + 'cursor: pointer;'
                            + 'box-sizing: border-box;'
                            + 'text-align: center;'
                          + '}'
                        + '</style>'
                        + '<div id="wipchat-tageditor-ui">⚙️</div>';
  
  document.body.innerHTML += launch_icon_html;

  var launch_icon_ui_menu_html = ''
                                + '<style>'
                                  + '#wipchat-tageditor-ui-menu {'
                                    + 'margin: 0;'
                                    + 'padding: 0;'
                                    + 'position: fixed;'
                                    + 'bottom: 17.5%;'
                                    + 'right: 5%;'
                                    + 'font-size: .55em;'
                                    + 'list-style-type: none;'
                                    + 'cursor: default;'
                                  + '}'
                                  + '#wipchat-tageditor-ui-menu > #wipchat-tageditor-move-hashtags > .wipchat-tageditor-label{'
                                    + 'margin: 0 1em;'
                                    + 'font-weight: 900;'
                                    + 'font-size: 0.75em;'
                                  + '}'
                                  + '#wipchat-tageditor-ui-menu > #wipchat-tageditor-move-hashtags > .wipchat-tageditor-move{'
                                    + 'cursor: pointer;'
                                  + '}'
                                + '</style>'
                                + '<ul id="wipchat-tageditor-ui-menu">'
                                  + '<li id="wipchat-tageditor-move-hashtags">'
                                    + '<span class="wipchat-tageditor-move wipchat-tageditor-move-left">👈</span>'
                                    + '<span class="wipchat-tageditor-label">Move Hashtags</span>'
                                    + '<span class="wipchat-tageditor-move wipchat-tageditor-move-right">👉</span>'
                                  + '</li>'
                                + '</ul>';

  // #2 activate menus
    var launch_icon_js_script = ''
                              + 'var tageditor_ui_dom = document.getElementById( "wipchat-tageditor-ui" ); '
                              + 'tageditor_ui_dom.style.fontSize = "0em"; '
                              + 'setTimeout( function(){ tageditor_ui_dom.style.fontSize = "3em"; }, 500 ); '
                              + 'tageditor_ui_dom.addEventListener( "click", function(){'
                                + 'var menu_wrapper = document.createElement( "div" );'
                                + 'menu_wrapper.innerHTML += launch_icon_ui_menu_html;'
                                + 'tageditor_ui_dom.appendChild( menu_wrapper );'
                                + 'document.querySelector( ".wipchat-tageditor-move-left" ).addEventListener( "click", function(e){'
                                  + 'e.stopPropagation();'
                                  + 'move_hashtags( "rtl" );'
                                + '});'
                                + 'document.querySelector( ".wipchat-tageditor-move-right" ).addEventListener( "click", function(e){'
                                  + 'e.stopPropagation();'
                                  + 'move_hashtags( "ltr" );'
                                + '});'
                              + '});';

    var launch_icon_js_dom_content = document.createTextNode( launch_icon_js_script ),
        launch_icon_js_dom = document.createElement("script");

    launch_icon_js_dom.appendChild( launch_icon_js_dom_content ); 
    document.body.appendChild( launch_icon_js_dom );

var is_moving_hashtags = false;

function move_hashtags( direction ){
  if( is_moving_hashtags ) return alert( 'already working. please wait a sec' );
  is_moving_hashtags = true;

  var valid_directions = [ 'ltr', 'rtl' ];
  if( ! direction || valid_directions.indexOf( direction ) === -1 ) direction = 'rtl';

  // #1 get todo dom elements
    var todos = document.querySelectorAll( '.todo > .todo__body > div' );

  // #2 add hashtag move step for all todos
    var task = new TaskManager();

    todos.forEach( function( todo_dom ){
      task.step( 'update todo', function(){

        // #4 click edit btn
          todo_dom.querySelector( '.todo__edit' ).click();

        setTimeout( function(){

          // #5 find input field
            var input = document.querySelector( '.todo--editing textarea' ),
                submit_btn = document.querySelector( '.todo--editing form input[type="submit"]' );

          // #6 do replacement in input field
            var todo = input.innerHTML,
                split_todo = todo.split( '#' );

            if( split_todo.length !== 2 ){
              submit_btn.click();
              return task.next();
            }

            var hashtag_position = todo.indexOf( '#' );

            if( direction === 'rtl' ){
              if( hashtag_position === 0 ){
                submit_btn.click();
                return task.next();
              } 

              var hashtag_text = split_todo[1],
                  split_hashtag_text = hashtag_text.split(' ');

              if( split_hashtag_text.length > 1 ) {
                alert( 'hashtag in this todo is not on the furthest right position. may be used in a sentence, so skipping!' );

                submit_btn.click();
                return task.next();
              }

              input.innerHTML = '#' + split_hashtag_text[0] + ' ' + split_todo[0];
            }

            if( direction === 'ltr' ){
              if( hashtag_position !== 0 ){
                alert( 'hashtag in this todo is not on the furthest left position. may be used in a sentence, so skipping!' );

                submit_btn.click();
                return task.next();
              }

              var hashtag_text = split_todo[1].split(' ', 1),
                  full_hashtag = '#' + hashtag_text;

              var cleaned_html = input.innerHTML.replace( full_hashtag, '' );

              input.innerHTML = cleaned_html + ' ' + full_hashtag;
            }

          // #7 submit update
            submit_btn.click();

          // #8 wait til its safe to continue
            setTimeout( task.next, 3000 );
        }, 1000 );
      });
    });

  // #3 start
    task.callback( function(){
      alert( 'all todos should be updated now!' );
      is_moving_hashtags = false;
    });

    task.start();
}

function TaskManager(callback){

  var current_step = 0,
      step_order = [],
      store = {},
      log = [],
      api = {},
      steps_run = 0,
      steps_deleted = 0,
      insertions = 0,
      started;

  if(!callback){ callback = function(){} }
  if(typeof callback !== 'function'){ throw new Error('TASK CALLBACK MUST BE A FUNCTION'); }
  
  // stats
    api.stats = {
      steps_run: function(){ return steps_run },
      steps_deleted: function(){ return steps_deleted }
    };
  
  // control flow
    api.start = start_task;
    api.step = create_task_step;
    api.next = run_next_task_step;
    api.end = end_task;

  // configuration
    api.get = get_task_variable;
    api.set = set_task_variable;
    api.unset = delete_task_varable;
    api.callback = set_task_callback;

  // logging
    api.log = function( entry ){
      if(entry) create_task_log_entry(entry);
      else return get_task_log();
    };

  return api;
  
  function set_task_callback(end_callback){

    if(typeof end_callback !== 'function'){ throw new Error('TASK CALLBACK MUST BE A FUNCTION'); }

    callback = end_callback;
  }

  function create_task_step(name, step){

    if(!name){ throw new Error('TASKS CAN\'T HAVE UNNAMED STEPS'); }
    if(typeof name !== 'string'){ throw new Error('STEP NAMES MUST BE STRINGS'); }
    if(!step || typeof step !== "function"){ throw new Error('TASK STEPS ARE FUNCTIONS'); }
    
    if( !started ) step_order.push({ name: name, step: step });

    else {

      step_order.splice( current_step + 1 + insertions, 0, { name: name, step: step });
      insertions += 1;
    }
  }

  function start_task(){

    if( started ) throw new Error('TASK HAS ALREADY STARTED');
    if( step_order.length < 1 ) throw new Error('TASK HAS NO STEPS TO RUN');

    started = true;

    setTimeout( step_order[0].step, 0 );
  }

  function run_next_task_step(){

    if( !started ) throw new Error('CAN\'T CALL NEXT STEP BEFORE TASK STARTS');

    steps_run += 1;

    // remove previously completed step
      step_order.shift();
      steps_deleted += 1;
      insertions = 0;

    // end task if no more steps remain
      var should_end_task = step_order.length === 0;
      if( should_end_task ) return api.end();

    setTimeout( step_order[ current_step ].step, 0 );
  }

  function end_task(){
    if( !started ) throw new Error('CAN\'T CALL NEXT STEP BEFORE TASK STARTS');

    callback.apply(callback, arguments);
    store = noticeboard = log = api = null;
  }

  function delete_task_varable(key){

    if(!key){ throw new Error('NEED A KEY TO DELETE DATA'); }
    if(typeof key !== 'string'){ throw new Error('KEY MUST BE A STRING'); }

    delete store[key];
  }

  function set_task_variable(key, value){

    if(!key){ throw new Error('NEED A KEY TO STORE DATA'); }
    if(typeof value === 'undefined'){ throw new Error('NEED A VALUE TO STORE'); }
    if(typeof key !== 'string'){ throw new Error('KEY MUST BE A STRING'); }

    store[key] = value;
  }

  function get_task_variable(key){

    if(!key){ throw new Error('NEED A KEY TO RETRIEVE DATA'); }
    if(typeof key !== 'string'){ throw new Error('KEY MUST BE A STRING'); }

    return (typeof store[key] !== 'undefined' ? store[key] : null);
  }

  function create_task_log_entry(entry){
    log.push(entry);
  }

  function get_task_log(){
    return log;
  }
}