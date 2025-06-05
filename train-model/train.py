import torch
import torch.nn as nn
from ultralytics import YOLO
from ultralytics.nn.modules import C2f, Conv

class IBN(nn.Module):
    def __init__(self, planes, ibn_type='a'):
        super(IBN, self).__init__()
        half = planes // 2
        self.half = half
        self.ibn_type = ibn_type

        if ibn_type == 'a':
            # Instance Norm di split channel pertama
            self.IN = nn.InstanceNorm2d(half, affine=True)
            self.BN = nn.BatchNorm2d(half)
        else:
            # Instance Norm di seluruh channel
            self.IN = nn.InstanceNorm2d(planes, affine=True)

    def forward(self, x):
        if self.ibn_type == 'a':
            split = torch.split(x, self.half, 1)
            out1 = self.IN(split[0])
            out2 = self.BN(split[1])
            out = torch.cat((out1, out2), 1)
        else:  # tipe 'b'
            out = self.IN(x)
        return out

class IBNConv(Conv):
    def __init__(self, c1, c2, k=1, s=1, p=None, g=1, d=1, act=True, ibn_type='a'):
        super().__init__(c1, c2, k, s, p, g, d, act)
        
        # Ganti BatchNorm dengan IBN untuk channel >= 32
        if c2 >= 32:
            # Simpan original bn untuk digunakan dalam sequence
            original_bn = self.bn if hasattr(self, 'bn') else nn.Identity()
            self.bn = nn.Sequential(
                IBN(c2, ibn_type=ibn_type),
                original_bn
            )

class IBnc2f(C2f):
    def __init__(self, c1, c2, n=1, shortcut=False, g=1, e=0.5, ibn_type='a'):
        super().__init__(c1, c2, n, shortcut, g, e)
        
        # Modifikasi konvolusi dengan IBNConv
        self.cv1 = IBNConv(c1, 2 * c2, 1, 1, ibn_type=ibn_type)
        self.cv2 = IBNConv((2 + n) * c2, c2, 1, ibn_type=ibn_type)
        
        # Modifikasi bottleneck dengan IBNConv
        self.m = nn.ModuleList(
            IBNConv(c2, c2, 3, 1, ibn_type=ibn_type) 
            for _ in range(n)
        )

def modify_yolov8_with_ibn(model, ibn_type='a'):
    """
    Modifikasi model YOLOv8 dengan mengganti Conv dan C2f dengan versi IBN
    """
    for name, module in model.model.named_children():
        if isinstance(module, Conv):
            # Ganti Conv dengan IBNConv
            model.model._modules[name] = IBNConv(
                module.conv.in_channels, 
                module.conv.out_channels, 
                k=module.conv.kernel_size[0],
                s=module.conv.stride[0],
                p=module.conv.padding[0],
                g=module.conv.groups,
                act=module.act is not None,
                ibn_type=ibn_type
            )
        
        elif isinstance(module, C2f):
            # Ganti C2f dengan IBnc2f
            model.model._modules[name] = IBnc2f(
                module.cv1.conv.in_channels,
                module.cv2.conv.out_channels,
                n=len(module.m),
                shortcut=module.shortcut,
                g=module.cv1.conv.groups,
                e=module.e,
                ibn_type=ibn_type
            )
    
    return model

def train_yolov8_ibn(data_yaml, model_size='n', ibn_type='a', epochs=200):
    """
    Fungsi untuk melatih YOLOv8 dengan IBN
    """
    # Load model dasar - gunakan nano untuk Raspberry Pi
    model = YOLO(f'yolov8{model_size}.pt')
    
    # Modifikasi dengan IBN
    model = modify_yolov8_with_ibn(model, ibn_type)
    
    # Konfigurasi pelatihan
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=320,  # Ukuran lebih kecil untuk Raspberry Pi
        batch=16,
        lr0=0.01,
        lrf=0.1,
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=3,
        warmup_momentum=0.8,
        cos_lr=True,
        close_mosaic=10,
        amp=True,
        device=0
    )
    
    return model, results

# Contoh penggunaan
if __name__ == "__main__":
    # Ganti dengan path dataset Anda
    data_yaml = "D:/PKM/ROBOTIK/TRAIN MODEL TELINGA/data.yaml"
    
    # Train model dengan IBN-Net tipe A - ukuran yang lebih kecil untuk Raspberry Pi
    model_a, results_a = train_yolov8_ibn(
        data_yaml, 
        model_size='n',  # Gunakan nano model untuk Raspberry Pi
        ibn_type='a',    # Tipe A untuk deteksi basket
        epochs=200
    )
    
    # Evaluasi model
    model_a.val()