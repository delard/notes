var app = {
    model: {},

    firebaseConfig: {
        apiKey: "AIzaSyCkZCJvywKI5N4y0ATHH-vDyPxsOXMf5qg",
        authDomain: "mrxmoocappmobile.firebaseapp.com",
        databaseURL: "https://mrxmoocappmobile.firebaseio.com",
        projectId: "mrxmoocappmobile",
        storageBucket: "mrxmoocappmobile.appspot.com",
        messagingSenderId: "24259100145"
    },

    inicio: function() {
        this.iniciaFastClick();
        this.iniciarFirebase();
        this.iniciaBotones();
        this.refrescarLista();
    },

    iniciaFastClick: function() {
        FastClick.attach(document.body);
    },

    iniciarFirebase: function() {
        firebase.initializeApp(this.firebaseConfig);
    },

    iniciaBotones: function(){
        var anadir =  document.querySelector("#anadir");
        var salvar =  document.querySelector("#salvar");

        anadir.addEventListener('click', this.mostrarEditor, false);
        salvar.addEventListener('click', this.salvarNota, false);;
    },

    refrescarLista: function(){
        var listaNotas = document.getElementById("notes-list");
        for(var i in app.model.notas) {
            var nuevaNota = document.createElement("div");
            nuevaNota.className="note-item";
            nuevaNota.id=i;
            nuevaNota.innerHTML = app.model.notas[i].titulo;
            listaNotas.appendChild(nuevaNota);
        }
    },

    visualizarNuevaNota: function() {
        var listaNotas = document.getElementById("notes-list");
        var nuevaNota = document.createElement("div");
        nuevaNota.className="note-item";
        nuevaNota.innerHTML = app.model.notas[app.model.notas.length-1].titulo;
        listaNotas.appendChild(nuevaNota);
    },

    mostrarEditor: function(){
        document.getElementById("titulo").value="";
        document.getElementById("comentario").value="";
        document.getElementById("note-editor").style.display="block";
        document.getElementById("titulo").focus();
    },

    salvarNota: function() {
        app.construirNota();
        app.ocultarEditor();
        app.visualizarNuevaNota();
        app.grabarDatos();
    },

    construirNota: function() {
        if(app.model.notas===undefined) {
            app.model['notas']=[];
        }
        var notas = app.model.notas;
        notas.push({"titulo": app.extraerTitulo(),
                    "comentario": app.extraerComentario()});
    },

    ocultarEditor: function() {
        document.getElementById("note-editor").style.display="none";
    },

    extraerTitulo: function() {
        return document.getElementById("titulo").value;
    },

    extraerComentario: function() {
        return document.getElementById("comentario").value;
    },
    
    // SALVAR
    grabarDatos: function() {
        window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, this.goFS, this.fail);
    },
    
    goFS: function(fileSystem) {
        fileSystem.getFile("files/"+"model.json", {create:true, exclusive: false}, app.gotFileEntry, app.fail);
      },
    
    gotFileEntry: function(fileEntry) {
        fileEntry.createWriter(app.gotFileWriter, app.fail);
    },

    gotFileWriter: function(writer) {
        writer.onwriteend = function(evt) {
            console.log("datos grabados en externalApplicationStorageDirectory");
            if(app.hayWifi()){
                app.salvarFirebase();
                document.getElementById("footer").innerText = "datos grabados FireBase";
            }
        };
        writer.write(JSON.stringify(app.model));
    },  

    // SALVAR FIREBASE
    hayWifi: function(){
        alert("hayWifi-inicio");
        document.getElementById("footer").innerText = "preguntando si hay WIFI ?";
        document.getElementById("footer").innerText = "preguntando si hay WIFI " + navigator.connection.type==='wifi';
        return navigator.connection.type==='wifi';
    },

    salvarFirebase: function(){
        var ref = firebase.storage().ref('model.json');
        ref.putString(JSON.stringify(app.model));
    },

    // ACCESO A DATOS
    leerDatos: function() {
        //alert("leerDatos-inicio");
        window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, 
                                        app.obtenerFS, 
                                        app.fail);
        //alert("leerDatos-fin");
      },
      
    obtenerFS: function(fileSystem) {
        //alert("obtenerFS-inicio");
        fileSystem.getFile("files/"+"model.json", null, app.obtenerFileEntry, app.fail); 
        //alert("obtenerFS-fin");

    },
        
    obtenerFileEntry: function(fileEntry) {
        //alert("obtenerFileEntry-inicio");
        fileEntry.file(app.leerFile, app.fail);
        //alert("obtenerFileEntry-fin");
    },
    
    leerFile: function(file) {
        //alert("leerFile-inicio");
        var reader = new FileReader();
        reader.onloadend = function(evt) {
          var data = evt.target.result;
          app.model = JSON.parse(data);
          app.inicio();
        };
        reader.readAsText(file);
        //alert("leerFile-fin");
    },
    
    fail: function(error) {
        alert('ERROR:' + JSON.stringify(error));
        app.grabarDatos();
        setTimeout(app.leerDatos, 0);
    }

};

if ('addEventListener' in document) {
    document.addEventListener('deviceready', function() {
        app.leerDatos();
    }, false);
  }