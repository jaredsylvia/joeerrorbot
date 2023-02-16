class command {
    trigger;
    text;
    author;
    id;
    help;
    

    //constructor
    constructor(id, trigger, text, help, author) {
        this.id = id;
        this.trigger = trigger;
        this.text = text;
        this.help = help;
        this.author = author;
        
        
    }

    //methods
    commandText(orig, term) {
        var text = this.text;
        text = text.replaceAll('{{orig}}', "@" + orig);
        text = text.replaceAll('{{term}}', term);
        return text;
    }
}
module.exports = command;
