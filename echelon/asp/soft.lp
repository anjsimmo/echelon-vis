% TODO: Decide whether okay to map longitude additional visual variables (e.g. a filter property)
% longitude must always be mapped to x, and only x
visual_prop(C, Sym, x, P) :- fieldtype(P,longitude), prop(C, P), sub_symbol(C, Sym).
not visual_prop(C, Sym, Var, P) :- fieldtype(P,longitude), prop(C, P), sym_var(Sym, Var), Var != x, sub_symbol(C, Sym).

% latitude must always be mapped to y, and only y
visual_prop(C, Sym, y, P) :- fieldtype(P,latitude), prop(C, P), sub_symbol(C, Sym).
not visual_prop(C, Sym, Var, P) :- fieldtype(P,latitude), prop(C, P), sym_var(Sym, Var), Var != y, sub_symbol(C, Sym).

% PoN claims that only interval can be encoded.
% Due to lack of guidelines specifically for quantitative data, we will treat it as interval.
:- fieldtype(P, quantitative), visual_prop(C, Sym, brightness, P).
:- fieldtype(P, quantitative), visual_prop(C, Sym, color, P).
:- fieldtype(P, quantitative), visual_prop(C, Sym, texture, P).
:- fieldtype(P, quantitative), visual_prop(C, Sym, shape, P).
:- fieldtype(P, quantitative), visual_prop(C, Sym, orientation, P).
:- fieldtype(P, ordinal),      visual_prop(C, Sym, color, P).
% Contradiction: PoN states texture is nominal, but Bertin states texture is ordered
:- fieldtype(P, ordinal),      visual_prop(C, Sym, texture, P).
:- fieldtype(P, ordinal),      visual_prop(C, Sym, shape, P).
:- fieldtype(P, ordinal),      visual_prop(C, Sym, orientation, P).
% Nominal can use any (although as noted by APT, shouldn't be used for size or saturation (brightness)).
:- fieldtype(P, nominal),      visual_prop(C, Sym, brightness,P).
:- fieldtype(P, nominal),      visual_prop(C, Sym, size,P).

% Redundant coding (avoid using only one visual variable to represent property)
% Weight of 2 to allow this to take priority over avoiding minor clash with constant color used elsewhere.
%:~ { visual_prop(Sym, Var, P) : visual_variable(Var) } 1, prop(Sym, P). [2, P]

% *Never* rely exclusively on color (as presents problems for color blind users)
:- { visual_prop(C, Sym2, Var, P) : sym_var(Sym2, Var), sub_symbol(C, Sym2)} 1,
   visual_prop(C, Sym, color, P), prop(C, P), sub_symbol(C, Sym).

% Primacy of Shape. *Always* ensure that all symbols have unique shape.
% (Also guarantees no "Symbol overload")
% (Currently applies to subsymbol, but should apply to combination of subsymbols)
:- 2 { used(C, Sym, shape, Val) : sub_symbol(C, Sym) }, prim_shape(Val).

% Perceptual popout (unique visual variable values)
% Penalize overlap: (Penalise each symbol so that 3 overlapping ranges is worse then 2)
%:~ 2 { usedrange(Sym2, VisVar2, P2, Val) : visual_prop(Sym2, VisVar2, P2), domain(VisVar, Val) }, usedrange(Sym, VisVar, P, Val). [10, Sym, VisVar, P, Val]
%:~ 1 { boundrange(Binding2, VisVar, Val) : binding(Binding2), domain(VisVar, Val) }, binding(Binding), boundrange(Binding, VisVar, Val). [10, Binding, VisVar, Val]

% Reward unique range (equivalent to penalising duplicates and unutilised design space):
%:~ 1 { usedrange(Sym2, VisVar2, P2, Val) : visual_prop(Sym2, VisVar2, P2) } 1, usedrange(Sym, VisVar, P, Val). [-1, Sym, VisVar, P, Val]
%:~ usedrange(Sym, VisVar, P, Val), visual_prop(Sym, VisVar, P), domain(VisVar, Val). [-1, Sym, VisVar, P, Val]
% TODO: Decide how pentalties apply to additional visual variables (e.g. a filter property)
% Penalise duplicates:
:~ 2 { used(C, Sym, VisVar, Val) : sub_symbol(C, Sym) }, retinal_variable(VisVar), domain(VisVar, Val). [10000, VisVar, Val]
% Penalise un-utilised: % TODO: Figure out how to prioritise assignment to important vars rather than arbitrarily
%:~ not used(Sym, VisVar, Val), symbol(Sym), visual_variable(VisVar), domain(VisVar, Val). [1, VisVar, Val]
:~ { used(C, Sym, VisVar, Val) : sub_symbol(C, Sym) } 0, retinal_variable(VisVar), domain(VisVar, Val). [1, VisVar, Val]

% Avoid overlapping regions
:~ 2 { usedxy(C, Sym, XVal, YVal) : sub_symbol(C, Sym) }, prim_x(XVal), prim_y(YVal). [1, XVal, YVal]
:~ { usedxy(C, Sym, XVal, YVal) : sub_symbol(C, Sym) } 0, prim_x(XVal), prim_y(YVal). [1, XVal, YVal]

%:~ 2 { used(Sym, Var, Val) : symbol(Sym) }, prim_x(XVal), prim_y(YVal). [1, XVal, YVal]
%:~ 2 { usedrange(Sym, xy, XVal, YVal) : sym:~ 2 { usedxy(C, Sym, XVal, YVal) : sub_symbol(C, Sym) }, prim_x(XVal), prim_y(YVal). [1, XVal, YVal]bol(Sym) }, prim_x(XVal), prim_y(YVal). [-1, XVal, YVal]

% Mapping for nominal values is arbitrary, but must be function and 1:1 (injective).
% Must be function
1 { map_enum(C, Sym, VisVar, P, IVal, OVal) : domain(VisVar, OVal) } 1 :- visual_prop(C, Sym, VisVar, P), fieldval(P, IVal).
% Must be 1:1 (injective)
{ map_enum(C, Sym, VisVar, P, IVal, OVal) : fieldval(P, IVal) } 1 :- visual_prop(C, Sym, VisVar, P), domain(VisVar, OVal).

% Interval values should only have 1 minimum
1 { map_min(C, Sym, VisVar, P, IVal, OVal) : domain(VisVar, OVal) } 1 :- visual_prop(C, Sym, VisVar, P), fieldmin(P, IVal).
% Interval values should only have 1 maximum
1 { map_max(C, Sym, VisVar, P, IVal, OVal) : domain(VisVar, OVal) } 1 :- visual_prop(C, Sym, VisVar, P), fieldmax(P, IVal).

% Select one bind type
1 { map_bind(C, Sym, VisVar, P, B) : bind_type(B) } 1 :- sub_symbol(C, Sym), visual_prop(C, Sym, VisVar, P).

map_bind(C, Sym, VisVar, P, bind_enum)  :- fieldval(P, _), sub_symbol(C, Sym), visual_prop(C, Sym, VisVar, P).
map_bind(C, Sym, VisVar, P, bind_range) :- fieldmin(P, _), sub_symbol(C, Sym), visual_prop(C, Sym, VisVar, P).
map_bind(C, Sym, VisVar, P, bind_range) :- fieldmax(P, _), sub_symbol(C, Sym), visual_prop(C, Sym, VisVar, P).
map_bind(C, Sym, VisVar, Role, bind_link) :- sub_symbol(C, Sym), prop(C, Role),
                                          fieldtype(Role, Class2), class(Class2),
                                          visual_prop(C, Sym, VisVar, Role).
%not map_bind(C, Sym, VisVar, P, bind_link) :- sub_symbol(C, Sym), prop(C, Role),
%                                              fieldtype(Role, Class2), not class(Class2),
%                                              visual_prop(C, Sym, VisVar, P).

% Constants only use a single value of a visual variable
usedenum(C, Sym, VisVar, P, OVal) :- map_enum(C, Sym, VisVar, P, _, OVal).
not usedenum(C, Sym, VisVar, P, OVal) :- { map_enum(C, Sym, VisVar, P, IVal, OVal) : fieldval(P, IVal) } 0,
                                      visual_prop(C, Sym, VisVar, P), domain(VisVar, OVal).
not usedenum(C, Sym, VisVar, P, OVal) :- not map_bind(C, Sym, VisVar, P, bind_enum),
                                      sub_symbol(C, Sym), visual_prop(C, Sym, VisVar, P), domain(VisVar, OVal).

% Ranges use the full range of a visual variable between the lower and upper values mapped to.
usedrange(C, Sym, VisVar, P, OVal) :- map_min(C, Sym, VisVar, P, _, OValMin), map_max(C, Sym, VisVar, P, _, OValMax), OVal >= OValMin, OVal <= OValMax,
                                   ordVal(OValMin), ordVal(OVal), ordVal(OValMax), map_bind(C, Sym, VisVar, P, bind_range).
% Ensure usedrange does not contain unused variables outside of range 
not usedrange(C, Sym, VisVar, P, OVal) :- map_min(C, Sym, VisVar, P, _, OValMin), map_max(C, Sym, VisVar, P, _, OValMax), OVal < OValMin, ordVal(OValMin), ordVal(OVal), map_bind(C, Sym, VisVar, P, bind_range).
not usedrange(C, Sym, VisVar, P, OVal) :- map_min(C, Sym, VisVar, P, _, OValMin), map_max(C, Sym, VisVar, P, _, OValMax), OVal > OValMax, ordVal(OValMax), ordVal(OVal), map_bind(C, Sym, VisVar, P, bind_range).
not usedrange(C, Sym, VisVar, P, OVal) :- not map_bind(C, Sym, VisVar, P, bind_range),
                                       sub_symbol(C, Sym), visual_prop(C, Sym, VisVar, P), domain(VisVar, OVal).

% Treat usedlink as always false (as have already accounted for use of visual space in symbol linked to) 
% usedlink(C, Sym, VisVar, P, OVal)

% Range must include at least 2 values!
2 { usedrange(C, Sym, VisVar, P, OVal) : domain(VisVar, OVal) } :- visual_prop(C, Sym, VisVar, P), map_bind(C, Sym, VisVar, P, bind_range).
% TODO: Alternative: assign to range bucket depending on OValMax - OValMin

used_p(C, Sym, VisVar, P, OVal) :- usedenum(C, Sym, VisVar, P, OVal).
used_p(C, Sym, VisVar, P, OVal) :- usedrange(C, Sym, VisVar, P, OVal).
not used_p(C, Sym, VisVar, P, OVal) :- not usedenum(C, Sym, VisVar, P, OVal), not usedrange(C, Sym, VisVar, P, OVal),
                                        visual_prop(C, Sym, VisVar, P), domain(VisVar, OVal).

used(C, Sym, VisVar, OVal) :- used_p(C, Sym, VisVar, _, OVal).
used(C, Sym, Var, Val) :- visual_const(C, Sym, Var, Val).
not used(C, Sym, VisVar, OVal) :- not used_p(C, Sym, VisVar, _, OVal), not visual_const(C, Sym, VisVar, OVal),
                               sub_symbol(C, Sym), visual_variable(VisVar), domain(VisVar, OVal).


% Penalize small ranges.
% Expands to 20 rules, each incuring penalty of 1. Range of 1 will be hit 20 times, whereas range of 20 gets hit only once.
% TODO: See if clingo offers a more concise/efficient way to expresss this.
%rangepenalty(1..20).
%:~ { usedrange(Sym, VisVar, P, OVal) } X, rangepenalty(X). [1000]
%:~ { usedrange(Sym, VisVar, P, OVal) : domain(VisVar, OVal) } 90, visual_prop(Sym, VisVar, P). [1000, Sym, P]
% 100 points for every unit of range (note: solving goes very slow for smaller weights)
%:~ usedrange(Sym, VisVar, P, OVal), domain(VisVar, OVal), visual_prop(Sym, VisVar, P). [-100, Sym, VisVar, P, OVal]
% -1 point for shared range
%:~ usedrange(Sym, VisVar, P, OVal), domain(VisVar, OVal),
%   visual_prop(Sym, VisVar, P). [1, Sym, P, VisVar, OVal]

% XY Plane is special: even if two regions share the same x value, they do not overlap unless they also share a y value.
usedxy(C, Sym, XVal, YVal) :- used(C, Sym, x, XVal), used(C, Sym, y, YVal).
not usedxy(C, Sym, XVal, YVal) :- not used(C, Sym, x, XVal), sub_symbol(C, Sym), prim_x(XVal), prim_y(YVal).
not usedxy(C, Sym, XVal, YVal) :- not used(C, Sym, y, YVal), sub_symbol(C, Sym), prim_x(XVal), prim_y(YVal).

