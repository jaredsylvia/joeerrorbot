/* TODO
 * constant rebalancing of stats per class
 * remove pissmance, as it was just a joke for one of the people helping me test and won't make it to the final game
 * 
 */
class player {
    //attributes
    name;
    xp = 0;
    coin = 10;
    maxHP;
    hp;
    attack;
    attackSpeed;
    kills;
    isDead;
    id;
    levelOfMonster;
    
    //constructor - arguments are id, name, class, level, xp, coin, maxHP, attack, attackSpeed, and kills
    constructor(name, levelOfMonster) {
        this.name = name;
        this.maxHP = 40;
        
        this.attack = 6;
        this.xp = levelOfMonster * 10;
        for (let i = 0; i < levelOfMonster; i++) {
            this.maxHP = this.maxHP + (Math.ceil(Math.random() * 10));
            this.coin = this.coin + (Math.ceil(Math.random() * 5));
            this.attack = this.attack + (Math.random() + .5);
            this.xp = this.xp + (this.attack + (Math.random() * 30));
        }
        this.xp = Math.round(this.xp);
        console.log(this.xp);
        this.hp = this.maxHP;
        this.isDead = false;
        
    }

    //methods
    heal(hp) {
        if (!Number.isNaN(hp)) {
            this.hp += hp;
            if (this.hp >= this.maxHP) {
                this.hp = this.maxHP;
            }
            if (this.hp > 0) {
                this.isDead = false;
            }
        }
    }

    takeDamage(damage) {

        if (!Number.isNaN(damage)) {
            this.hp -= damage;
            if (this.hp <= 0) {
                this.hp = 0;
                this.isDead = true;
            }
        }

    }
    
    calculateDamage() {
        var damage = 0;
        for (let i = 0; i <= this.attack; i++) {
            damage += Math.ceil(Math.random() * 8);

        }

        return damage;
    }

    calculateDamage() {
        var damage = 0;
        for (let i = 0; i <= this.attack; i++) {
            damage += Math.ceil(Math.random() * 8);

        }

        return damage;
    }

    //getters and setters
    setName(name) {
        if (!name.length >= 0) {
            this.name = name;
        }
    }
}
module.exports = player;

