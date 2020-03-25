% Generators

% Each data class has an associated symbol
%symbol(C) :- class(C).

% TODO: Composite / multiple symbols
%prim_subsym(1..3).
%1 { sub_symbol(C, Sym) : prim_subsym(Sym) } :- class(C).

% TODO: Replace these rules with custom rules for visual grammar.
% Lines have a start marker, midmarker, endmarker, and linestyle.
%sub_symbol(C, startmarker) :- implantation(C, line).
%sub_symbol(C, midmarker  ) :- implantation(C, line).
%sub_symbol(C, endmarker  ) :- implantation(C, line).
%sub_symbol(C, linestyle  ) :- implantation(C, line).
%sub_symbol(C, simple     ) :- implantation(C, point).

% Top level data graph -> symbol graph
sub_symbol(graph, graph).

% Experimental: Use every available sub_symbol
%1 { sub_symbol(C, Sym) : class(C) } :- sym_part(Sym).

% Each class should be associated with 1 (and only one) sub_symbol.
% TODO: Consider allowing multiple representations / perspectives
:- { sub_symbol(C, Sym) : sym_part(Sym) } 0, class(C).
:- 2 { sub_symbol(C, Sym) : sym_part(Sym) }, class(C).

% Symbol that should only be associated with a single class. (e.g. points in a connected path)
% TODO: Only a violation if classes have common parent and are not mutually exclusive (JSON Schema oneOf)
%{ sub_symbol(C, Sym) : class(C) } 1 :- sym_single_class(Sym).
% TODO: Consider 1:1 relationships
{ sub_symbol(C, SymB) : datarel(CA, C, hasinst) } 1 :- sub_symbol(CA, SymA), symrel(SymA, SymB, oneinst).
%:- sub_symbol(C, SymB), datarel(CA, C, Rel), sub_symbol(CA, SymA), symrel(SymA, SymB, oneinst), Rel != hasinst, datareltype(Rel).
{ sub_symbol(C, SymB) : datarel(CA, C, hasclass) } 1 :- sub_symbol(CA, SymA), symrel(SymA, SymB, oneclass).
%:- sub_symbol(C, SymB), datarel(CA, C, Rel), sub_symbol(CA, SymA), symrel(SymA, SymB, oneinst), Rel != hasclass, datareltype(Rel).
{ sub_symbol(C, SymB) : datarel(CA, C, hasclass) } :- sub_symbol(CA, SymA), symrel(SymA, SymB, manyclass).
%:- sub_symbol(C, SymB), datarel(CA, C, Rel), sub_symbol(CA, SymA), symrel(SymA, SymB, oneinst), Rel != hasclass, datareltype(Rel).

% Output mapping of sub symbols and their data bindings.
relmap(CA, SymA, SymB, C, inst)  :- sub_symbol(CA, SymA), symrel(SymA, SymB, oneinst),
                                    datarel(CA, C, hasinst), sub_symbol(C, SymB).
relmap(CA, SymA, SymB, C, class) :- sub_symbol(CA, SymA), symrel(SymA, SymB, oneclass),
                                    sub_symbol(C, SymB), datarel(CA, C, hasclass).
relmap(CA, SymA, SymB, C, class) :- sub_symbol(CA, SymA), symrel(SymA, SymB, manyclass),
                                    sub_symbol(C, SymB), datarel(CA, C, hasclass).

% TODO: Consider re-aranging rules to be in a positive form (reward rather than penalise)
% If class and symbol share the same semantic connotation, then ideally should be linked.
:~ not sub_symbol(C, Sym), suggests_class(C, Sem), suggests_sympart(Sym, Sem). [1, C, Sem, Sym]
% If prop and symbol var share same semantic connotation, then ideally should be linked.
:~ not visual_prop(C, Sym, Var, P), prop(C, P), suggests_prop(P, Sem), sym_var(Sym, Var), suggests_symvar(Var, Sem). [1, C, Sym, Var, P]
% Use symbols / colors that correpsond with semantics of data
:~ not visual_const(C, Sym, Var, Val), sub_symbol(C, Sym), suggests_class(C, Sem), suggests_var(Var, Val, Sem). [1, Var, C, Sym]
% TODO: use semantics when assigning colors to values in enums

% Symbols that should only be associated with a single instance.
%singleton(C) :- sub_symbol(C, Sym), class(C), sym_single_inst(Sym).
%sym_single_class(Sym) :- sym_single_inst(Sym).

% Structure of data and visualisation schema should (approximately) match

% If class is a child of parent, then its symbol must also be a child of parent's symbol
%:- sub_symbol(CA, SymA), rel(CA, CB, has), sub_symbol(CB, SymB), not rel(SymA, SymB, has).


%valid_sub_symbol(CB, SymB) :- sub_symbol(CX, SymX),
%                              rel(CA, CB, has),
%                              rel(CX, CB, ancestor),
%                              rel(CX, SymB, has),
%                              link_prop(CB, CA).

% Multiple classes can use the same (abstract) symbol, so long as each class has unique (concrete) shape.

% Each symbol has 1 (and only 1) shape. (Unless unsupported, e.g. a line)
1 { visual_const(C, Sym, shape, Val) : prim_shape(Val) } 1 :- sub_symbol(C, Sym), sym_var(Sym, shape).
% Lines don't have a shape. (Although Bertin allows it)
%visual_const(C, Sym, shape, na) :- sub_symbol(C, Sym), Sym == linestyle.

% Each symbol must have at most 1 color
{ visual_const(C, Sym, color, Val) : prim_color(Val) } 1 :- sub_symbol(C, Sym), sym_var(Sym, color).


% Each symbol must have at most 1 brightness
{ visual_const(C, Sym, brightness, Val) : prim_brightness(Val) } 1 :- sub_symbol(C, Sym), sym_var(Sym, brightness).

% Each symbol must have at most 1 texture
{ visual_const(C, Sym, texture, Val) : prim_texture(Val) } 1 :- sub_symbol(C, Sym), sym_var(Sym, texture).

% Each symbol must have at most 1 orientation
{ visual_const(C, Sym, orientation, Val) : prim_orientation(Val) } 1 :- sub_symbol(C, Sym), sym_var(Sym, orientation).
%visual_const(C, Sym, orientation, na) :- sub_symbol(C, Sym), Sym == linestyle.

% Each symbol must have at most 1 size
{ visual_const(C, Sym, size, Val) : prim_size(Val) } 1 :- sub_symbol(C, Sym), sym_var(Sym, size).

% Each symbol must have at most 1 xpos
{ visual_const(C, Sym, x, Val) : prim_x(Val) } 1 :- sub_symbol(C, Sym), sym_var(Sym, x).

% Each symbol must have at most 1 ypos
{ visual_const(C, Sym, y, Val) : prim_y(Val) } 1 :- sub_symbol(C, Sym), sym_var(Sym, y).


% Each symbol must have at most 1 xpos
%{ visual_const(Sym, x, Val) : prim_x(Val) } 1 :- symbol(Sym).

% Each symbol must have at most 1 ypos
%{ visual_const(Sym, y, Val) : prim_y(Val) } 1 :- symbol(Sym).

% Each visual variable for a symbol may be associated with at most 1 property
{ visual_prop(C, Sym, Var, P) : prop(C, P) } 1 :- sub_symbol(C, Sym), sym_var(Sym, Var).

% Every property has an encoding (visual_prop) (and optionally redundant encodings!)
% Property must be in scope.
% Note: If class has direct properties, ensure that there are correpsonding direct symbols to map to, else no solution will be found.
1 { visual_prop(C, Sym, Var, P) : sub_symbol(C, Sym), sym_var(Sym, Var) } :- prop(C, P).

% Shared properties should use same mapping regardless of symbol
%{ visual_prop(C2, Sym2, Var2, P) : sub_symbol(C2, Sym2), visual_variable(Var2),  Var != Var2} 0 :- visual_prop(C, Sym, Var, P).
visual_prop(C2, Sym2, Var, P) :- visual_prop(C, Sym, Var, P), sub_symbol(C2, Sym2), prop(C2, P), sym_var(Sym2, Var).


% References to objects should share a visual property
% with the object that they point to.
% (or at least share label if using textual representation)
% TODO: Link to id (or unique property)
%1 { visual_prop(Sym, Var, Role),
%    visual_prop(Class, Var, P) : visual_variable(Var), prop(Class, P) } :-
%   prop(Sym, Role), fieldtype(Role, Class).

% References must share a mapping with the class they link to
%:~ not visual_prop(ClassSym, Var, P), visual_prop(Sym, Var, Role), visual_variable(Var),
%   fieldtype(Role, ClassSym), prop(ClassSym, P), symbol(ClassSym), symbol(Sym), fieldtype(Role, ref). [2000]
%:~ visual_prop(road, y, starthub), not visual_prop(hub, y, P), visual_variable(y),
%   fieldtype(starthub, hub), prop(hub, P), symbol(hub), symbol(road), fieldtype(starthub, ref). [2000]
%:~ visual_prop(road, Var, starthub), 0 { visual_prop(hub, Var, P) : prop(hub, P) } 0, visual_variable(Var),
%   fieldtype(starthub, hub), symbol(hub), symbol(road), fieldtype(starthub, ref). [2000]

% TODO: Re-enable
%1 { visual_prop(ClassSym, Var, P) : prop(ClassSym, P) } :-
%  symbol(Sym), visual_prop(Sym, Var, Role), visual_variable(Var), fieldtype(Role, ClassSym), symbol(ClassSym).


% NOTE: This will be handled by the renderer.
% Need to link to unique visual attributes (similar to a foreign / surrogate key).
% For now, force linkage on position
%visual_prop(Sym, x, Role), visual_prop(Class, x, P) :-
%  prop(Sym, Role), fieldtype(Role, Class).
%visual_prop(Sym, y, Role), visual_prop(Class, y, P) :-
%  prop(Sym, Role), fieldtype(Role, Class).

% testing part / constraints

% Bind const is like binding to the class itself.
bind_type(bind_range; bind_enum; bind_link).

% If a visual property encoding exists, then a constant should not be defined.
:- visual_const(C, Sym, Var, _), visual_prop(C, Sym, Var, _).

% If no prop, then declare a constant
%:- not visual_const(C, Sym, Var, _), not visual_prop(C, Sym, Var, _), sub_symbol(C, Sym), visual_variable(Var).
:- not visual_const(C, Sym, Var, _), not visual_prop(C, Sym, Var, _), sub_symbol(C, Sym), sym_var(Sym, Var).
% May need an implicit id field so that we have something to
% link to.
