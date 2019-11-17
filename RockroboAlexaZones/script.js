let msg = "";
let id = "";

subscribe({
  id: "alexa2.0.History.summary",
  change: "ne" 
}, function(obj) {
    id = getState('alexa2.0.History.serialNumber'/*serialNumber*/).val
    log('Starte id '+ id)
    msg = obj.newState.val;
    findrooms();
});

function findrooms (){
log(msg);
let stext = ''; 
// find keywords
let wrongkey = msg.match(/sprich mir nach|asd/);

let key = msg.match(/sauge|sage|reinige|wische|staubsauger/);

if(!wrongkey && key){
    let command = {"command":"zoned_cleanup","zone_ids": []};

    let kitchen = msg.match(/küche|Küche/);
    let vorrat = msg.match(/vorratsraum|speisekammer/);
    let wohnzimmer = msg.match(/wohnzimmer|esszimmer/);
    let flur = msg.match(/flur|diele/);
    let bad = msg.match(/bad|badezimmer|gästebad|gästebadezimmer/);

    if(kitchen){
        stext += 'Küche';
        command.zone_ids.push("Kueche");
    } 
    if(vorrat){
        stext += ', Vorratsraum ';
        command.zone_ids.push("Vorrat");
    } 
    if(wohnzimmer){
        stext += ', Wohnzimmer ';
        command.zone_ids.push("Wohnzimmer");

    } 
    if(flur){
        stext += ', Flur ';
        command.zone_ids.push("Diele");
    }
    if(bad){
        stext += ', Gästebadezimmer ';
        command.zone_ids.push("Gaestebad");

    } 
    
    //add und to the end
    var n = stext.lastIndexOf(',');
    let lenght
    stext = stext.slice(0, n) + stext.slice(n).replace(',', 'und');  
    log(JSON.stringify(command))

    setStateDelayed('alexa2.0.Echo-Devices.'+ id +'.Commands.speak', 'Aber ich lasse den Staubsauger  '+ stext +' saugen!',1500);
    setStateDelayed('mqtt.0.valetudo.rockrobo.custom_command'/*valetudo/rockrobo/custom command*/, JSON.stringify(command),1500);
}

    

}