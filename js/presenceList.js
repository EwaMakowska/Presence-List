/*global $, presenceList */
            
var presenceList = (function(){
    var init = function ($container){
        presenceList.shell.init($container);
    };
    return {init: init};
}());

presenceList.shell = (function () {
    var
    db = {
        connect: (function(){
            var config;
            config = {
                apiKey: "AIzaSyBW0mloHb0wOH3Nwj5azFSQpYvDONdpEiM",
                authDomain: "attendancelist-3208b.firebaseapp.com",
                databaseURL: "https://attendancelist-3208b.firebaseio.com",
                projectId: "attendancelist-3208b",
                storageBucket: "attendancelist-3208b.appspot.com",
                messagingSenderId: "198822631760"
            };         
            return firebase.initializeApp(config);
        }()),
        
        select: function(col, func){
            var col, func, refDb;
            
            if(func == null){
                func = function(){};
            };
            
            refDb = firebase.database().ref().child(col);
            refDb.on('value', func);
            return refDb;
        }
    },
        
    template = {
        html: String()
            +'<div id="dialogDeleteCorf" title="Are you sure?">'
                +'<p>If you are sure you want to delete this date please click ok</p>'
            +'</div>'
    
            +'<div id="dialogHelp" title="HOW TO:">'
                    +'<p>Double-click to add button (+) to add presence of appropriate employee (only current day)</p>'
                    +'<p>Click to employee surname to show his/her presence</p>'
                    +'<p>Double-click to wrong day on the calendar to remove it</p>'
            +'</div>'
    
            +'<div id="addSuccesfully">'
                +'<p>ADD SUCCESFULLY</p>'
            +'</div>'   
    
            +'<div class="row header">'           
                +'<div class="logo">'
                    +'<div>LOGO</div>'
                +'</div>'
                +'<div id="help">HELP</div>'
            +'</div>'
            +'<div class="row">'
                +'<div class ="content">'
                    +'<div class="col-md-4 employeesList" id="empList">'
                        +'<div id="groupBts">'
                            +'<div id="showInfBts-group">'
                            +'</div>'
                            +'<div id="addInfBts-group">'
                            +'</div>'                
                        +'</div>'
                    +'</div>'
                    +'<div class="col-md-8 calendar" id="calendar"></div>'
                +'</div>'
            +'<div>',
    
        containers: { 
            employeesList: 'empList',
            calendar: '#calendar'
        }
    },
    
    jQueryDialog = function(funcName){
        var funcName, dialogBt, height, opener, toOpen;
        
        if(funcName == 'help'){
            dialogBt = {
                Ok: function() {
                    $(this).dialog("close");
                    return false;
                }
            };
            height = 300;
            opener = "#help";
            toOpen = "#dialogHelp";
        };
        
        if(funcName == 'deleteAction'){
            dialogBt = {
                    OK:  function() {
                        $(this).dialog("close");
                        jQueryDialogCallback(true);
                    },
                    Cancel: function() {
                        $( this ).dialog("close");
                        jQueryDialogCallback(false);
                    }  
            };
            height = 200;
            opener = ".marked";
            toOpen = "#dialogDeleteCorf";
        };
        
        if(funcName == 'addInfBtAction'){
            dialogBt = {
                Ok: function() {
                    $(this).dialog("close");
                    return false;
                }
            };
            height = 200;
            opener = '#groupBts button#addInfBt';
            toOpen = "#addSuccesfully";
        };
        
        $("#dialogHelp, #dialogDeleteCorf, #addSuccesfully").dialog({
            hide: "puff",
            show : "slide",
            height: height,
            autoOpen: false,
            buttons: dialogBt
        });
            $(opener).click(function() {
                $(toOpen).dialog("open");
            });
    },
                
    init, employees, calendar, addInfBtAction, showInfBtAction, deleteAction;
    
    addInfBtAction = function(){
        
        $('#groupBts button#addInfBt').on('click',function(){
            var
            temp = {},
            empId = $(this).attr("empId"),
            today = moment().format("DD-MM-YYYY");
            
            temp[today] = today;
            db.select("data/"+empId, null).update(temp);
            jQueryDialog('addInfBtAction');           
        });
    };
    
    showInfBtAction = function(){
        
        $('#groupBts button#showInfBt').on('click',function(){
            var empId = $(this).attr("empId"),
            dataFromCalArr = [],
            temp;
            
            $('.clndr-table td.day').removeClass('marked');
            
            $('.clndr-table .day').each(function(){
                var temp = $(this).attr('class').indexOf('-day-')+4;
                dataFromCalArr.push($(this).attr('class').substr(temp+1,10));
            });
            
            var getDataFromDb = function(snap){
                $.each(snap.val(), function(v){
                    if(v != null){
                        $.each(dataFromCalArr, function(i, x){
                           if(v == x){
                               $('.clndr-table td.day').eq(i).addClass('marked');
                               deleteAction(empId);
                           }
                        });
                    }
                });
            return true;    
            };
            db.select("data/"+empId, getDataFromDb);
        });
        
    };
    
    deleteAction = function(empId){
        
        $('.marked').click(function(){
            var temp, del, that;
            
            temp = $(this).attr('class').indexOf('-day-')+4;
            del = $(this).attr('class').substr(temp+1,10);
            that = this;
            jQueryDialog('deleteAction');
            
            jQueryDialogCallback = function (val){
                if(val == true){
                    db.select("data/"+empId+"/"+del, null).remove();
                    $(that).removeClass('marked');
                }
                return true;
            };
        });
        
    };
        
    employees = function(){
        
        var getEmpList = function(snap){
            var createBts = jQuery.map(snap.val(), function(v, i){
                var showInfBts = '<button type="button" id="showInfBt" class="btn-warning btn-lg" empId='+i+'>'+v+'</button>';
                $('#showInfBts-group').append(showInfBts+'<div></div>');
                
                var addInfBts = '<button type="button" id="addInfBt" class="btn-warning btn-lg" empId='+i+'>+</button><div>';
                $('#addInfBts-group').append(addInfBts);
                return {showInfBt : showInfBts, addInfBts : addInfBts};
            });
            
            addInfBtAction();
            showInfBtAction();
        };
        
        db.select('emp', getEmpList);
        return true;
    };
    
    calendar = function(){
        moment.locale('pl');
        //console.log(moment().calendar())
        $(template.containers.calendar).clndr({
            moment: moment
        });
    };
    
    init = function($container){
        $container.html(template.html);
        calendar();
        employees();
        jQueryDialog('help', null);
    };
    
    return {init: init};
}());
