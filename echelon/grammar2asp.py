#!/usr/bin/env python3

# Todo: consider using model transformation language (e.g. JSON equivalent of XSLT) to
# covert schema to ASP.
import json
import sys

def getClassNameIts(ctx, prop):
    return "{}".format(prop)

def getClassNameObj(ctx, prop):
    return "{}".format(prop)

def deref(schema, jsonobj):
    if "$ref" in jsonobj:
        path = jsonobj["$ref"]
        if path.startswith("#/"):
            path = path[2:] # strip leading '#/'
            hierarchy = path.split("/")
            node = schema
            for h in hierarchy:
                node = node[h]
            jsonobj = node
        # TODO: Handle non-absolute paths
    return jsonobj

def process(inputjson):
    result = []
    processing_queue = [("graph", inputjson)]

    while processing_queue != []:
        res = processing_queue.pop()
        (ctx,obj) = res
        obj = deref(inputjson, obj)
        
        result.append("sym_part({}).".format(ctx))
        for prop, propval in obj["properties"].items():
            type = propval["type"]
            
            if type == "array":
                its = propval["items"]
                itsclass = getClassNameIts(ctx, prop)
                # TODO: Fix
                result.append("symrel({},{},manyclass).".format(ctx, itsclass))
                processing_queue.append((itsclass, its))
            elif type == "object":
                itclass = getClassNameObj(ctx, prop)
                # result.append("sym_var({0},{1},{2}).".format(ctx, prop, itclass))
                result.append("symrel({},{},oneinst).".format(ctx, itclass))
                processing_queue.append((itclass, propval))
            else:
                # TODO: Consider whether we should include var name.
                # result.append("sym_var({0},{1},{2}).".format(ctx,prop,type))
                result.append("sym_var({0},{2}).".format(ctx,prop,type))
                # print("var = " + "sym_var({0},{2}).".format(ctx,prop,type))
                # print("obj = " + str(obj))
                # print("propval = " + str(propval))
                if "description" in propval:
                    desc = propval["description"]
                    result.append("suggests_symvar({0},{1}).".format(type, desc))
                # print ("suggests_desc({0},{1}).".format(ctx, desc))
        if "description" in obj:
            desc = obj["description"]
            result.append("suggests_sympart({0},{1}).".format(ctx, desc))
    return result

def main():
    # Usage ./schema2asp.py schema.json > rules.lp
    try:
        inputfile = sys.argv[1]
    except IndexError:
        # default
        inputfile = "asp/indoor-general/indoor-grammar.json"
    
    with open(inputfile) as input:
      inputjson = json.load(input)

    result = process(inputjson)
    
    # Strip out rules for root graph
    include_graph = True
    if not include_graph:
        result = [r for r in result if not (r.startswith("sym_part(graph)")
                                            or r.startswith("sym_var(graph,"))]
    print ("\n".join(result))

if __name__ == "__main__":
    main()
