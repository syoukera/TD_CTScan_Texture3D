from TDStoreTools import StorageManager
import TDFunctions as TDF

import pydicom
import os
import numpy as np
import math

# root_dir = 'E:\\Material\\CT_Scan\\20230215_born_h4\\S0000000001'
root_dir = 'C:\\Users\\sakir\\Desktop\\20241006_CTScan\\20230215_born_h4\\S0000000001'

op_table = op('table_slice')

class dicom:
	"""
	dicom description
	"""
	def __init__(self, ownerComp):
		
		# The component to which this extension is attached
		self.ownerComp = ownerComp
		
		# list for dcm data 
		dcms = []
		# walck through files in root_dir
		for d, s, fl in os.walk(root_dir):
			# each file in files
			for fn in fl:
				# only append DCM files
				if ".dcm" in fn.lower():
					# append path of DCM files to list
					dcms.append(os.path.join(d, fn))

		# to know size of a dcm image, read dicom data usign pydicom package
		ref_dicom = pydicom.read_file(dcms[0])
		# save number of rows
		self.rows = ref_dicom.Rows
		# save number of columns
		self.columns = ref_dicom.Columns
		# save number of dcm files
		self.Num_dcm = len(dcms)

		# initialize ndarray for save 3-dimentional dcm data
		self.D_array = np.zeros((self.rows, self.columns, len(dcms)), dtype=ref_dicom.pixel_array.dtype)
		# save each dcm file to 3-dimentional ndarray
		for dcm in dcms:
			# load a dcm file using pydicom
			d = pydicom.read_file(dcm)
			# assign data of a dcm file to 3-dimentional ndarray
			self.D_array[:, :, dcms.index(dcm)] = d.pixel_array

	def GetIthLayer(self, depth):

		# normalize depth by number of dcm
		index = math.floor(depth*(self.Num_dcm-1))

		print(self.D_array[:, :, index])
		
		return