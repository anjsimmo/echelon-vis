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
        
        result.append("class({}).".format(ctx))
        for prop, propval in obj["properties"].items():
            type = propval["type"]
            
            if type == "array":
                its = propval["items"]
                itsclass = getClassNameIts(ctx, prop)
                result.append("datarel({},{},hasclass).".format(ctx, itsclass))
                processing_queue.append((itsclass, its))
            elif type == "object":
                itclass = getClassNameObj(ctx, prop)
                # TODO: Consider turning this into single tuple
                #result.append("prop({0},{1}).\nfieldtype({1},{2}).".format(ctx, prop, itclass))
                result.append("datarel({},{},hasinst).".format(ctx, itclass))
                processing_queue.append((itclass, propval))
            else:
                # if type == "number":
                #   result.append("prop({},{}).\nfieldtype({},number).".format(ctx,prop))
                # elif type == "integer":
                #   result.append("prop({},{}).\nfieldtype({},integer).".format(ctx,prop))
                result.append("prop({0},{1}).\nfieldtype({1},{2}).".format(ctx,prop,type))
      
                if "description" in propval:
                    desc = propval["description"]
                    result.append("suggests_prop({},{}).".format(prop, desc))
                    if desc == "angular":
                        result.append("fieldtype({},angular).".format(prop))
                    elif desc == "latitude":
                        result.append("fieldtype({},latitude).".format(prop))
                    elif desc == "longitude":
                        result.append("fieldtype({},longitude).".format(prop))
                if "enum" in propval:
                    result.append("fieldtype({},enum).".format(prop))
                    for val in propval["enum"]:
                        result.append("fieldval({},{}).".format(prop, val))
                if "minimum" in propval:
                    result.append("fieldmin({},{}).".format(prop, propval["minimum"]))
                if "maximum" in propval:
                    result.append("fieldmax({},{}).".format(prop, propval["maximum"]))

        if "description" in obj:
            desc = obj["description"]
            result.append("suggests_class({0},{1}).".format(ctx, desc))

    return result

def main():
    # Usage ./schema2asp.py schema.json > rules.lp
    try:
        inputfile = sys.argv[1]
    except IndexError:
        # default
        inputfile = "asp/examples/traffic_schema_simple.json"
    
    with open(inputfile) as input:
      inputjson = json.load(input)

    result = process(inputjson)
    
    # Strip out rules for root graph
    include_graph = True
    include_graph_rel = True
    if not include_graph:
        result = [r for r in result if not r.startswith("class(graph)")]
    if not include_graph_rel:
        result = [r for r in result if not r.startswith("datarel(graph,")]
    print ("\n".join(result))

if __name__ == "__main__":
    main()
