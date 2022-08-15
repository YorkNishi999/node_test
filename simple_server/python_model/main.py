import sys, csv
import json
import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from transformers import BertTokenizer, BertForSequenceClassification

attr_map = {
  "0": "Food",
  "1": "Ambiance",
  "2": "Location",
  "3": "Service",
  "4": "Price",
  "5": "General"
}

def main():# attribute
  # set device
  # device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
  device = torch.device("cpu")
  print("Device:", device)

  #0. settings
  max_length = 128
  # data_path = './data/interim/inference_data.txt'
  data_path = sys.argv[1]
  attr_model_path = '/home/yohei/project/node_test/simple_server/python_model/models/model_transformers_attr'
  sent_model_path = '/home/yohei/project/node_test/simple_server/python_model/models/model_transformers_sent'
  MODEL_NAME = 'bert-base-uncased'
  tokenizer = BertTokenizer.from_pretrained(MODEL_NAME, do_lower_case=True)

  #1. input data and encoding
  text = []

  try:
    doc_test=pd.read_csv(data_path) # should be changed
    for data in doc_test.iterrows():
      text.append(data[1]['sentence'])
  except:
    print('Error: file not found')
    sys.exit() # exit でOK？-> API化したら、エラーを返すようにする

  encoding = tokenizer(
      text,
      max_length=max_length,
      padding='max_length',
      truncation=True,
  )
  encoding = { k: torch.tensor(v).to(device) for k, v in encoding.items() }

  #2. load model
  bert_sc_attr = BertForSequenceClassification.from_pretrained(attr_model_path).to(device)
  bert_sc_sent = BertForSequenceClassification.from_pretrained(sent_model_path).to(device)

  #3. inference for attribute
  with torch.no_grad():
    output = bert_sc_attr(**encoding)

  scores = output['logits']
  attr_labels_predicted = torch.argmax(scores, axis=1).cpu().numpy()

  #4. inference for sentiment
  with torch.no_grad():
    output = bert_sc_sent(**encoding)

  scores = output['logits']
  sent_labels_predicted = torch.argmax(scores, axis=1).cpu().numpy()

  predicted_summary_d = {}
  for i, attr_num in enumerate(attr_labels_predicted):
    attr_num = str(attr_num)
    sent_num = str(sent_labels_predicted[i])
    # print(attr_num, sent_num) # for debug
    if attr_num in predicted_summary_d: 
      if sent_num in predicted_summary_d[attr_num]:
        predicted_summary_d[attr_num][sent_num] += 1
      else:
        predicted_summary_d[attr_num][sent_num] = 1
    #もしattr_numがないなら、ラベルを作る
    else:
      predicted_summary_d[attr_num] = {sent_num: 1}

  # print("predicted_summary_d:", predicted_summary_d) # for debug
  

  # sort and make dict to tuple
  for a in predicted_summary_d:
    predicted_summary_d[a] = sorted(predicted_summary_d[a].items())
  predicted_summary_d = sorted(predicted_summary_d.items())
  print("predicted_summary_d:", predicted_summary_d) # for debug

  output_data = []

  for a in predicted_summary_d:
    dic = {}
    dic['attribute'] = a[0]
    dic['attribute_label'] = attr_map[a[0]]
    list = []
    print("a[1]: ", a[1])

    # インデックスの集合を作る
    set_index = set()
    for s in a[1]:
      print("s: ", s)
      set_index.add(int(s[0]))

    print("set_index: ", set_index)
    for c in range(5):
      d = {}
      print("c: ", c)
      if c in set_index:
        print("koko")
        d['name'] = str(c)
        for i in a[1]:
          if int(i[0]) == c:
            d['value'] = i[1]
            break
        list.append(d)
        print("list: ", list)
      else:
        d['name'] = str(c)
        d['value'] = 0
        list.append(d)
        print("list: ", list)

    dic['sentiment'] = list
    output_data.append(dic)

  print("output_data:", output_data) # for debug

  predicted_summary_json = json.dumps(output_data)
  # print("predicted_summary_json: ", predicted_summary_json) # for debug

  #5. output
  unique_time = data_path.split('/')[-1].split('_')[-1].split('.')[0]

  ## JSON output for internal use
  outputFileName = './downloads/output_json_' + unique_time + '.txt'
  with open(outputFileName, 'w') as f:
    f.write(predicted_summary_json)

  ## CSV output for users
  outputFileName = './downloads/output_' + unique_time + '.csv'
  with open(outputFileName, "w", encoding='utf-8') as f:
    writer = csv.writer(f)
    for i in range(len(text)):
      writer.writerow( [str(text[i]).rstrip('\r\n'), str(attr_labels_predicted[i]), str(sent_labels_predicted[i])] )

  f.close()
  return predicted_summary_json


if __name__ == "__main__":
  predicted_summary_json = main()