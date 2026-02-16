const crossingClasses = {
    "Charter": "Command",
    "Alpha": "Avatar",
    "Beta": "Bankai",
    "Gamma": "Ga Kill",
    "Delta": "Doreamon",
    "Epsilon": "Evangelion",
    "Zeta": "ZFighter",
    "Eta": "Edgerunners",
    "Theta": "Titan",
}

class Brother {

    constructor(firstName, lineName, lastName, position, classYear, graduationYear, major, hometown, imageUrl, hobbies, bigsNames, littlesNames, crossingClass, minor, family, PM, PD, lineNumber) {
        this.firstName = firstName;
        this.lineName = lineName;
        this.lastName = lastName;
        this.position = position;
        this.classYear = classYear;
        this.graduationYear = graduationYear;
        this.major = major;
        this.hometown = hometown;
        this.imageUrl = imageUrl;
        this.bigsNames = bigsNames || [];
        this.bigs = [];
        this.littlesNames = littlesNames || [];
        this.littles = [];
        this.hobbies = hobbies;
        this.crossingClass = crossingClass;
        this.minor = minor;
        this.family = family;
        this.PM = PM;
        this.PD = PD;
        this.lineNumber = lineNumber;
    }

    getFullName() {
        return `${this.firstName} "${this.lineName}" ${this.lastName}`;
    }

    setBig(bigBrothers) {
        this.bigs = bigBrothers;
    }

    setLittle(littleBrothers) {
        this.littles = littleBrothers;
    }

    getCrossingClass() {
        return this.crossingClass ? (this.crossingClass + " " + crossingClasses[this.crossingClass]) : "N/A";
    }
}

export default Brother;