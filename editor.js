// modify wip.chat todo tags

// #0 configure replacement map
  var replacement_map = {
    "[create]": "⚡",
    "[cheer]": "🎉",
    "[plan]": "🤷",
    "[yay]": "🎉",
    "[do]": "⚡"
  }

// #1 get todo dom elements
  var todos = document.querySelectorAll( '.todo > .todo__body > div' );

// #2 extract todo titles from elements
  var todo_titles = [];
  todos.forEach( ( todo ) => todo_titles.push( todo.innerText ) );

// #3 create list of dom elements to edit
  var todos_to_edit = [];

  for( var i = 0; i <= todos.length - 1; i += 1 ){
    var replaced_title = get_replacement( todo_titles[ i ] );
    if( replaced_title ) todos_to_edit.push( todos[ i ] );

    if( replaced_title ) console.log( '#' + i + '\n' + todo_titles[i] + '\n' + replaced_title, todos[ i ] );
    else console.log( '#' + i + ' <nothing to replace>' );
  }

if( todos_to_edit.length < 1 ) alert( 'no todos need tag replacement' );
else {

  var task = TaskManager();

  todos_to_edit.forEach( function( todo_to_edit ){
    task.step( 'update todo', function(){
      var edit_btn = todo_to_edit.querySelector( '.todo__edit' ),
          todo_id = edit_btn.href.replace( /\D/g,'' );

      // #4 enter edit mode
        edit_btn.click();

      setTimeout( function(){
        var todo_edit_state_dom = document.querySelector( '#todo_'+ todo_id +'.todo--editing' );

        // #5 find input field
          var input = todo_edit_state_dom.querySelector( 'textarea' );

        // #6 do replacement in input field
          input.innerHTML = get_replacement( input.innerHTML );

        // #7 submit update
          var submit_btn = todo_edit_state_dom.querySelector( 'input[type="submit"]' );

          submit_btn.click();

        // #8 wait til its safe to continue
          setTimeout( task.next, 3000 );
      }, 1000 );
    });
  });

  task.callback( function(){
    alert( 'all todos should be updated now!' );
  });

  task.start();
}


function get_replacement( todo_title ){
  var replaced_title = null;

  for( var key in replacement_map ){
    if( ! replacement_map.hasOwnProperty( key ) ) continue;

    if( has_tag( key, todo_title ) ){
      replaced_title = update_tags( key, replacement_map[ key ], todo_title );
    }
  }

  return replaced_title;
}


function update_tags( tag, next_tag, todo_title ){
  var replaced_title = false;

  if( has_tag( tag, todo_title ) ){
    replaced_title = todo_title.replace( tag, next_tag );
  }

  return replaced_title ? replaced_title : todo_title;
}

function has_tag( tag, title ){
  return title.indexOf( tag ) > -1;
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