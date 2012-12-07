// A nil move is situational and requires the opponent having played "by the book"
// I assume kingside castles as Ke1g1 and queenside castles as Ke1c1 queenside is generally a less defensible option.
var WHITE = {
   // These are general openers they aren't guaranteed and to code all of the variations is absurd, hopefully they will naturally arrise.    
  "RUY_LOPEZ":["Pe2e4", "Ng1f3","Be1b5", "Ke1g1", "Pd2d4"],
  "SCHOLARS_MATE":["Pe2e4", "Qd1h5", "Bf1c4", "Qh5f7"],
  "ENGLISH":["Pc2c4"]
};

var BLACK = {
    "SLAV":["Pd7d5","Pc7c6"],
    "FRENCH":["Pe7e6"],
    "Sicilian":["Pc7c5"]
};