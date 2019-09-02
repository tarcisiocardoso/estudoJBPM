var currentProcess = null;
var currentC;
var currentP;
var currentPI;
var currentCID;
var currentPID;
var currentPIID;
var user;
var taskId;
var task;

function montaProcessos(){
	
	$.get( "/user", function( data ) {	  
		 user = data;
		 console.log( user );
		 var grupo = '';
		 for(var item in user.authorities){
			 if( grupo.length> 0 ) grupo+= ', ';
			 var s = user.authorities[item].authority.split('_')[1];
			 grupo += s;
		 }
		 $('.container').find('p').html('<b>Usuário: </b>'+user.name+'<br><b>Grupo:</b> '+grupo);
		}, "json");
	
	$.get( "/rest/server/containers", function( data ) {	  
		  var o = data.result['kie-containers'];
		  var arr = o['kie-container'];
		  
		  for(var x in arr){
			  var nome = arr[x]['container-alias'];
			  if( nome.indexOf('kjar')> 0 ){
				  nome = nome.split('-kjar')[0];
			  }
			  $('.panel-heading').html('<h2>'+nome+'</h2>');
			  getDefinicaoProcesso( {id: arr[x]['container-id'], nome: arr[x]['container-alias']});
		  }
		  
		}, "json");
}

function getDefinicaoProcesso( item ){

	$.get( "/rest/server/containers/"+item.id+"/processes", function( data ) {	  
		
		var conteudo = '';//'<p><h2>'+item.nome+'</h2></p>';
		
		data.processes.forEach( function(process){
			var nome = process['process-name'];
			var id = process['process-id'];
			conteudo += '<div class="row">';
			conteudo += '  <div class="col-sm-4">'+nome+'</div>';
			conteudo += '  <div class="col-sm-8"><button type="button" onclick="novoProcesso(\''+item.id+'\', \''+id+'\')" class="btn btn-link">Iniciar</button></div>';
			conteudo += '</div>';
			
		});
		conteudo +='</ul>'
		$( "#processo" ).append( conteudo );
		
	}, "json");
}

function montaInstancia(){
	$( "#instancia" ).empty();
	$.get( "/rest/server/containers", function( data ) {	  
		  var o = data.result['kie-containers'];
		  var arr = o['kie-container'];
		  var cid = '';
		  for(var x in arr){
			  cid = arr[x]['container-id'];
		  }
		  getInstanciaProcesso( {id: cid});
		  
		}, "json");
}

function getInstanciaProcesso( item ){

	$.get( "/rest/server/containers/"+item.id+"/processes/instances?status=1&status=2", function( data ) {	  
		
		data['process-instance'].forEach( function(process){
			var t = document.querySelector('#mytemplate');
			

			
			var conteudo = ''; //'<h3>'+process['process-name']+':</h3> ';
			
			var pid = process['process-id'];
			var piid = process['process-instance-id'];
			var status = process['process-instance-state'];
			
			t.content.querySelector('p').textContent= piid+': '+startTime(process['start-date']);
			t.content.querySelector('b').textContent= process['process-name'];
			
			$(t.content.querySelector('#btn')).html('<button type="button" onclick="verProcesso(\''+item.id+'\', \''+piid+'\', \''+pid+'\')" class="btn btn-link">Ver Processo</button>');
			if( process['process-instance-state'] ==1 ){
				//$(t.content.querySelector('#btn')).append('<button type="button" onclick="exec(\''+item.id+'\', \''+piid+'\', \''+pid+'\')" class="btn btn-link">Executar</button>');
				$(t.content.querySelector('#btn')).append('<button type="button" onclick="analisarWorkitems(\''+item.id+'\', \''+piid+'\', \''+pid+'\')" class="btn btn-link">Executar</button>');
			}
			var clone = document.importNode(t.content, true);
			$( "#instancia" ).append( clone ); 

		});
		
	}, "json");
}

function startTime(time){
	var date = new Date( time['java.util.Date']);
	return  date.getDate() + '/' +  (date.getMonth() + 1) +'/'+ date.getFullYear()+ ' '+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
}
function novoProcesso(cid, pid){
	currentCID = cid;
	currentPID = pid;
	
	var URL = "/rest/server/containers/"+cid+"/forms/processes/"+pid;
	
	$.ajax({
	    url: URL ,
	    headers: {
	        'Accept': 'application/json',
	        'Content-Type': 'application/json; charset=utf-8'
	    },
	    method: "GET",
	    success: function(data){
	    	console.log( data);
	    	for( var x in data){
	    		var form = data[x];
	    		if( form ){
	    			console.log(form.name );
	    			for(var y in form.fields){
	    				
	    				montaFormularioIniciarProcesso(form.name, form.fields);
	    			}
	    		}
	    		break; // pensar quando tiver varios forms
	    	}
	    },
	    fail:function(erro) {
	        console.log( "error", erro );
	    }
	});
	
	
	
}
function criarProcesso(){
	
	var URL = "/rest/server/containers/"+currentCID+"/processes/"+currentPID+"/instances";
	var data = getFormData( $('#taskForm'));
	
	$.ajax({
	    url: URL ,
	    headers: {
	        'Accept': 'application/json',
	        'Content-Type': 'application/json; charset=utf-8'
	    },
	    method: "POST",
	    success: function(data){
	    	console.log( data);
	    	montaInstancia();
	    	$('#myModal').modal('hide');    
	    },
	    fail:function(erro) {
	        console.log( "error", erro );
	    },
	    data: JSON.stringify(data)
	});
}
function montaFormulario(formName, fields){
	var t = document.querySelector('#formTemplateProcesso');
	
	t.content.querySelector('h2').textContent= formName;
	
	var conteudo = '';
	for(var x in fields){
		console.log(x, fields[x]);
		var field = fields[x];
		conteudo += "<label for='"+field.name+"'>"+field.label+"</label>";
		var readonly = '';
		if( field.readOnly && field.readOnly === true ){
			readonly = 'readonly';
		}
		if( field.code && field.code == 'TextArea' ){
			conteudo += "<textarea class='form-control' name='"+field.name+"' rows='"+field.rows+"' "+readonly+"></textarea>";
		}else{
			conteudo += "<input type='text' class='form-control' name='"+field.name+"' "+readonly+"></input>";
		}
	}
	
	/*for( var x in data.taskInputs){
		console.log( x, data.taskInputs[x] );
		if( data.taskInputs[x] == 'String'){
			conteudo = "<b>"+x+": </b><input type='text' name='"+x+"'></input>";
		}
	}*/
	t.content.querySelector('.form-group').innerHTML=conteudo;
	
	var clone = document.importNode(t.content, true);
	
	$('#myModal').find('.modal-header > h4').text( formName );
	$('#myModal').find('.modal-body').html( clone );
	
	
	
	$('#myModal').modal();
}
function montaFormularioIniciarProcesso(formName, fields){
	montaFormulario(formName, fields);
	$('#myModal').find('button[name=processo]').show();
	$('#myModal').find('button[name=task]').hide();
}
function montaFormularioConcluirTarefa(formName, fields){
	montaFormulario(formName, fields);
	$('#myModal').find('button[name=task]').show();
	$('#myModal').find('button[name=processo]').hide();
}
function analisarWorkitems(cid, piid, pid){
	currentCID = cid;
	currentPID = pid;
	currentPIID = piid;
	
	var URL = "/rest/server/containers/"+cid+"/processes/instances/"+piid+"/workitems"; //"/rest/server/containers/"+cid+"/processes/instances/"+piid+"/workitems";
	
	$.ajax({
	    url: URL ,
	    dataType: 'json',
	    type: 'GET',
	    success: function(data){
	    	console.log( data );
	    	var temPermissao = false;
	    	for(var x in data['work-item-instance'] ){
	    		var item = data['work-item-instance'][x];
	    		console.log( item );
	    		if( temPermisao(item) ){
	    			console.log( 'tem permissão' );
	    			exec(cid, piid, pid);
	    			temPermissao = true;
	    		}
	    	}
	    	if( !temPermissao){
	    		alert('Sem permissão');
	    	}
	    }
	});
}
function exec(cid, piid, pid){
	currentCID = cid;
	currentPID = pid;
	currentPIID = piid;	
	var URL = "/rest/server/containers/"+cid+"/processes/instances/"+piid;
    
    $.ajax({
	    url: URL ,
	    dataType: 'json',
	    type: 'GET',
	    success: function(data){         
	        //$("#image_div").html(data);

	    	currentProcess = data;	    
	    	if( 'active-user-tasks' in currentProcess){
	    		if( currentProcess['active-user-tasks'] == null ){
	    			//PUT /server/containers/{containerId}/tasks/{taskInstanceId}/states/activated
	    			//alert('Atividade esta suspensa' );
	    			var URL = "/rest/server/containers/"+cid+"/forms/tasks/"+piid;
	    			
	    			$.ajax({
	    			    url: URL ,
	    			    headers: {
	    			        'Accept': 'application/json',
	    			        'Content-Type': 'application/json; charset=utf-8'
	    			    },
	    			    method: "GET",
	    			    success: function(data){
	    			    	console.log('-->', data);
	    			    	for( var x in data){
	    			    		var form = data[x];
	    			    		if( form ){
	    			    			console.log(form.name );
	    			    			for(var y in form.fields){
	    			    				
	    			    				montaFormularioConcluirTarefa(form.name, form.fields);
	    			    			}
	    			    		}
	    			    		break; // pensar quando tiver varios forms
	    			    	}
	    			    },
	    			    fail:function(erro) {
	    			        console.log( "error", erro );
	    			    }
	    			});
	    		}else{
		    		for(var x in currentProcess['active-user-tasks']['task-summary']){
		    			var userTask = currentProcess['active-user-tasks']['task-summary'][x];
		    			console.log('xxx>', userTask );
		    			montaUserTask(userTask);
		    		}
	    		}
	    	}
	    }
	});

}
function verProcesso(cid, piid, pid){
	if( cid == null ) cid = currentCID;
	if( piid == null ) piid = currentPIID;
	
    var URL = "/rest/server/containers/"+cid+"/images/processes/instances/"+piid;
    $.ajax({
	    url: URL ,
	    dataType: 'html',
	    type: 'GET',
	    success: function(data){         
	        $("#image_div").html(data);
	    }
	});

}
function montaUserTask(userTask){
		
	taskId = userTask['task-id'];
	task = userTask;
	
	var URL = "/rest/server/containers/"+currentCID+"/processes/definitions/"+currentPID+"/tasks/users/"+userTask['task-name']+"/inputs";
//	console.log( URL );
    $.ajax({
	    url: URL ,
	    dataType: 'json',
	    type: 'GET',
	    success: function(data){
	    	console.log('==>', data );
	    	var t = document.querySelector('#formTemplate');
			
			t.content.querySelector('h2').textContent= userTask['task-description']?userTask['task-description']:'';
			
			var conteudo = '';
			for( var x in data.taskInputs){
				console.log( x, data.taskInputs[x] );
				if( data.taskInputs[x] == 'String'){
					conteudo += "<b>"+x+": </b><input type='text' name='"+x+"'></input>";
				}
			}
			t.content.querySelector('#taskForm').innerHTML=conteudo;
			
			var clone = document.importNode(t.content, true);
			
	    	$('#myModal').find('.modal-header > h4').text( userTask['task-name'] );
	    	$('#myModal').find('.modal-body').html( clone );
	    	
	    	$('#myModal').modal();
	    	
	    	$('#myModal').find('button[name=task]').show();
	    	$('#myModal').find('button[name=processo]').hide();
	    }
	});
}
function proximaAtividade(){
	console.log('>>>>proximaAtividade()<<<<');
	//if( task['task-status'] == 'Reserved'){
		var URL = "/rest/server/containers/"+currentCID+"/tasks/"+taskId+"/states/started";
		
		$.ajax({
		    url: URL ,
		    headers: {
//		        'Accept': 'application/json',
		        'Content-Type': 'application/json; charset=utf-8'
		    },
		    type: 'PUT',
		    success: function(data){
		    	console.log('>>done<<', data );
				completarAtividade();  	
		    },
		    error: function(erro, arg2, arg3){
		    	if( erro.status == 404){
		    		alert( "Não permitido" );
		    	}else{
		    		alert( erro.responseText );
		    	}
		    	console.log( erro );
		    	console.log( arg2 );		    	
		    	console.log( arg3 );		    	
		    }
		});
//	}else{
//		completarAtividade();		
//	}
}
function completarAtividade(){
	console.log('>>>>completarAtividade()<<<<');
	
	var URL = "/rest/server/containers/"+currentCID+"/tasks/"+taskId+"/states/completed";
	
	var data = getFormData( $('#taskForm'));
	
	$.ajax({
	    url: URL ,
	    headers: {
//	        'Accept': 'application/json',
	        'Content-Type': 'application/json; charset=utf-8'
	    },
	    type: 'PUT',
	    data: JSON.stringify(data),
	    success: function(data){
	    	$('#myModal').modal('hide');    		    	
	    	montaInstancia();
	    	verProcesso();
	    },
	    error: function(erro){
	    	console.log( erro );
	    }
	});
}

function getFormData($form){
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}
function temPermisao(workitem){
	
	if( workitem['work-item-params'].ActorId && workitem['work-item-params'].ActorId == user.principal.username){
		return true;
	}
	for(var x in user.authorities){
		var grupo = user.authorities[x].authority;
		console.log( grupo );
		
			var item = workitem['work-item-params'].GroupId;
			if( grupo.indexOf(item)>= 0 ){
				return true;
			}
		
	}
	
	return false;
}



