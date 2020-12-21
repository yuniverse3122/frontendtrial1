from py.utils.pave import Model  # pylint: disable=import-error
from tensorflow.python.tools.inspect_checkpoint import print_tensors_in_checkpoint_file
from tensorflow.python.platform import gfile
from tensorflow.python.tools import freeze_graph
from PIL import Image, ImageDraw
import io
import base64
import tensorflow
import os
import numpy as np
import scipy.misc

tf = tensorflow.compat.v1

# session = None
# with tf.Session() as sess:
#     dir_path = os.path.dirname(os.path.realpath(__file__)).replace('\\', '/')
#     saver = tf.train.import_meta_graph(
#         f'{dir_path}/models/resnet/Epoch_707.ckpt.meta')
#     saver.restore(sess, f'{dir_path}/models/resnet/Epoch_707.ckpt')
#     tf.train.write_graph(
#         sess.graph, f'{dir_path}/models/resnet', 'saved_model.pb', as_text=False)
#     writer = tf.summary.FileWriter(f'{dir_path}/models/resnet', sess.graph)
#     sess.close()

# dir_path = os.path.dirname(os.path.realpath(__file__)).replace('\\', '/')
# model_path = f'{dir_path}/models/resnet'
# freeze_graph.freeze_graph(
#     input_graph=f'{model_path}/saved_model.pb',
#     input_checkpoint=f'{model_path}/Epoch_707.ckpt',
#     output_graph=f'{model_path}/resnet.pb',
#     output_node_names='resnet50/probs',
#     input_saver='',
#     input_binary=True,
#     restore_op_name='save/restore_all',
#     filename_tensor_name='save/Const:0',
#     clear_devices=True,
#     initializer_nodes=''
# )

dir_path = os.path.dirname(os.path.realpath(__file__)).replace('\\', '/')
session = tf.Session(config=tf.ConfigProto())
with gfile.GFile(f'{dir_path}/models/resnet/resnet.pb', 'rb') as f:
    graph_def = tf.GraphDef()
    graph_def.ParseFromString(f.read())
    tf.import_graph_def(graph_def, name='')


class Classifier(Model):
    def run(self, data):
        image_data = data.replace('data:image/jpeg;base64,', '')
        im = Image.open(io.BytesIO(base64.b64decode(image_data)))
        im_width, im_height = im.size
        tile_sizes = [50, 250, 500]
        tile_batch_size = 1000

        def get_tile(i, j, tile_size):
            if tile_size == 250:
                offset = 100
            elif tile_size == 500:
                offset = 225
            else:
                offset = 0
            tile = np.asarray(
                im.crop((j - offset, i - offset, j + tile_size - offset, i + tile_size - offset)))
            return tile if tile_size == tile_sizes[0] else Image.fromarray(tile).resize((tile_sizes[0], tile_sizes[0]), Image.BILINEAR)
        im_tiles = [[get_tile(i, j, tile_size) for j in range(0, im_width, tile_sizes[0])
                     for i in range(0, im_height, tile_sizes[0])] for tile_size in tile_sizes]
        imgs = [np.dstack((im_tiles[0][i], im_tiles[1][i], im_tiles[2][i]))
                for i in range(len(im_tiles[0]))]
        img_groups = [imgs[i:(i+tile_batch_size)]
                      for i in range(0, len(imgs), tile_batch_size)]
        results = [[]]*len(img_groups)
        output = []
        for i in range(len(img_groups)):
            print(i, 'of', range(len(img_groups)))
            input_x = np.array(img_groups[i]) / 255
            results[i] = session.run('resnet50/probs:0',
                                     feed_dict={'input_x1:0': input_x})
        output = [result for group in results for result in group]

        colors = ['#778887', '#00ff00', '#ffff00', '#20b2aa', '#ff00ff', '#0000ff',
                  '#ff5e00', '#38ad31 ', '#00ffff', 'transparent', '#ff0000', 'transparent']
        tile_labels = np.transpose(np.argmax(output, axis=1).reshape(
            (int(np.ceil(im_width / 50)), int(np.ceil(im_height / 50))))).reshape((-1, 1)).tolist()

        return {
            'labels': tile_labels,
            'columns': np.ceil(im_width / 50.),
            'rows': np.ceil(im_height / 50.),
            'colors': colors
        }
