import json
import sys

def remove_textures(filepath):
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    if 'images' in data:
        del data['images']
    if 'textures' in data:
        del data['textures']
    if 'samplers' in data:
        del data['samplers']
    
    if 'materials' in data:
        for mat in data['materials']:
            if 'pbrMetallicRoughness' in mat:
                if 'baseColorTexture' in mat['pbrMetallicRoughness']:
                    del mat['pbrMetallicRoughness']['baseColorTexture']
                if 'metallicRoughnessTexture' in mat['pbrMetallicRoughness']:
                    del mat['pbrMetallicRoughness']['metallicRoughnessTexture']
            if 'normalTexture' in mat:
                del mat['normalTexture']
            if 'occlusionTexture' in mat:
                del mat['occlusionTexture']
            if 'emissiveTexture' in mat:
                del mat['emissiveTexture']

    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

if __name__ == '__main__':
    remove_textures(sys.argv[1])
