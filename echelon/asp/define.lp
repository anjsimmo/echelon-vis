


% PoN => 10-15
%prim_x(x1;x2;x3;x4;x5;x6;x7;x8;x9;x10;x11;x12;x13;x14;x15).
prim_x(1..15).
%prim_y(y1;s2;s3;s4;y5;y6;y7;y8;y9;y10;y11;y12;y13;y14;y15).
prim_y(1..15).

% Theoretically unlimited.
% However, only around "around 6" [Moody 2010 i*] are recommended for novice users.
% TODO: Use full scale
prim_shape(rect;circle;triangle).
%prim_shape(rect;ellipse;triangle;hexagon;octagon;obround).

% PoN => 7-10. Note that Bertin considers grey a color.
% Bertin considers "violet" and "purple" as different colors (Color variation, p.85)
%prim_color(red;orange;yellow;green;blue;violet;purple;grey).
prim_color(red;orange;yellow;green;cyan;blue;magenta;grey). % TODO: Change to perceptual color scale.

% PoN => Interval scale, 20 steps.
%prim_size(s1;s2;s3;s4;s5;s6;s7;s8;s9;s10;s11;s12;s13;s14;s15;s16;s17;s18;s19;s20).
% TODO: Reduce to just discriminable steps
prim_size(1..20).

% PoN => Brightness is Ordinal with capacity of 6-7.
% b1 => white, b7 => black
% TODO: Use full scale
%prim_brightness(b3;b5).
% prim_brightness(b1;b2;b3;b4;b5;b6;b7).
%prim_brightness(1..7).
prim_brightness(2..6). % TODO: Allow Black / White extremes only under limited conditions.

% PoN => Texture has capacity of 2-5
%prim_texture(t1;t2;t3;t4;t5).
prim_texture(1..5).

% PoN => Orientation has capacity of 4
% Bertin suggests using 30 and 60 degrees rather than orthogonal axes at 45 degrees.
% (Bertin notes that signs parallel to axis of perception stand out when viewing paper from side, but not sure if this applies to screen)
prim_orientation(deg0;deg30;deg90;deg60).

val(Val) :- prim_x(Val).
val(Val) :- prim_y(Val).
val(Val) :- prim_shape(Val).
val(Val) :- prim_color(Val).
val(Val) :- prim_size(Val).
val(Val) :- prim_brightness(Val).
val(Val) :- prim_texture(Val).
val(Val) :- prim_orientation(Val).

%ordered(x;y;size;brightness;texture);
ordVal(Val) :- prim_x(Val).
ordVal(Val) :- prim_y(Val).
ordVal(Val) :- prim_size(Val).
ordVal(Val) :- prim_brightness(Val).
ordVal(Val) :- prim_texture(Val).

domain(x, Val)        :- prim_x(Val).
domain(y, Val)        :- prim_y(Val).
domain(shape, Val)       :- prim_shape(Val).
domain(color, Val)       :- prim_color(Val).
domain(size, Val)        :- prim_size(Val).
domain(brightness, Val)  :- prim_brightness(Val).
domain(texture, Val)     :- prim_texture(Val).
domain(orientation, Val) :- prim_orientation(Val).

% start-mark, mid-mark, end-mark
%edge(S,S1,S2) :- prim_shape(S), prim_shape(S1), prim_shape(S2).

%reltype(is_a;shares_with;has;to).
datareltype(hasinst;hasclass).
%topology(subset;intersection;hierarchy;seq).

planar_variable(x;y).
retinal_variable(size;color;brightness;texture;orientation;shape).
visual_variable(VisVar) :- planar_variable(VisVar).
visual_variable(VisVar) :- retinal_variable(VisVar).

% After 400 seconds, still failed to find solution
%used_combo(Sym,PD1,PD2,Si,C,V,T,Or,Sh) :- symbol(Sym), used(Sym,x,PD1), used(Sym,y,PD2),
%                                          used(Sym, size, Si), used(Sym, color, C), used(Sym, brightness, V),
%                                          used(Sym, texture, T), used(Sym, orientation, Or), used(Sym, shape, Sh).
% Ensure that symbols are unique (conjunction). i.e. Ensure that no two symbols could map to the same combo.
%:- { used_combo(Sym,PD1,PD2,Si,C,V,T,Or,Sh) : symbol(Sym) } 1, prim_x(PD1), prim_y(PD2),
%                                                               prim_size(Si), prim_color(C), prim_brightness(V),
%                                                               prim_texture(T), prim_orientation(Or), prim_shape(Sh).
% Work around: will just ensure each symbol has a unique shape (which is recommended by moody anyway)


% Mapping a property uses up all values of that variable. TODO: Allow mapping to sub-range.
% used(Sym, Var, Val) :- visual_prop(Sym, Var, _), val(Val). % Removed -- now use maps
% Map a range
% Requires range to be declared.
% Only link to unique properties.
%

% Special fieldtypes
% Angular is a special type of quantitative value (inherit constraints).
fieldtype(P, quantitative) :- fieldtype(P, angular).
% Angular fields (if displayed) should be mapped to the (polar) x-axis (rotation)
:- fieldtype(P,angular), visual_prop(C, Sym, size, P).
:- fieldtype(P,angular), visual_prop(C, Sym, y, P).
polar(C, Sym) :- visual_prop(C, Sym, x, P), fieldtype(P, angular).

% If there are two fields that reference other objects, then it's an edge!
edge(C) :- 2 { prop(C, RoleA) : fieldtype(RoleA, ClassA), class(ClassA) }, class(C).

% TODO: Re-enable?
% A (named) instance of a class is a special type of nominal value
% fieldtype(Role, ref) :- prop(Sym, Role), fieldtype(Role, Class), class(Class).
% fieldtype(Role, nominal) :- fieldtype(Role, ref).


% == For consuming json ==
fieldtype(P,number) :- fieldtype(P,integer).
fieldtype(P,quantitative) :- fieldtype(P,number), not fieldtype(P,enum).
fieldtype(P,ordinal) :- fieldtype(P,number), fieldtype(P,enum).
fieldtype(P,nominal) :- fieldtype(P,string).
fieldtype(P,nominal) :- fieldtype(P,string), fieldtype(P,enum).
fieldtype(P,sequence) :- fieldtype(P,temporal). % TODO: Extract

% Convert "has" relationship into a foreign key from the child
%prop(Child, Parent) :- rel(Parent,Child,has), class(Parent), class(Child).
%fieldtype(Parent, Parent) :- rel(Parent,Child,has), class(Parent), class(Child).

% Always link to x and y
% Disabled: Only desirable if edge between two nodes.
%visual_prop(C, Sym, x, Role) :- sub_symbol(C, Sym), prop(C, Role),
%                                fieldtype(Role, Class2), class(Class2).
%visual_prop(C, Sym, y, Role) :- sub_symbol(C, Sym), prop(C, Role),
%                                fieldtype(Role, Class2), class(Class2).

prim_implantation(mark; line).

% Edges must be represented as a line, not a mark.
implantation(C, line) :- edge(C).
% Assume list of ordinal values connected by line/path (trajectory).
% TODO: Only if ordinal values are unique. Introduce way to disable. Deal with multiple ordinal values (2 lines?).
% TODO: Distinguish line/paths (trajectory) from relationships with 2 ends (hypergraphs).
% For now, will only apply this to 'sequence' fields. (e.g. temporal)
implantation(C, line) :- prop(C, P), fieldtype(P, sequence).

% TODO: Areas?

% Pont (default)
implantation(C, point) :- not implantation(C, line), class(C).

%1 { visual_prop(ClassSym, Var, P) : prop(ClassSym, P) } :-
%  symbol(Sym), visual_prop(Sym, Var, Role), fieldtype(Role, ClassSym), symbol(ClassSym).


