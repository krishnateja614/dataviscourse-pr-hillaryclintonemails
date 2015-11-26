
library(readr)
#library(RSQLite)
library(topicmodels)
library(dplyr)
library(stringi)
library(tm)
library(LDAvis)
library(servr)

# If you want to read the SQLite database,uncomment the above library(RSQLite) and then uncomment the following lines
#db <- dbConnect(dbDriver("SQLite"), "../input/database.sqlite")
#sample <- dbGetQuery(db, "
#SELECT p.Name Sender,
#       e.MetadataSubject Subject
#FROM Emails e
#INNER JOIN Persons p ON e.SenderPersonId=p.Id
#LIMIT 10")
#print(sample)

# You can read a CSV file like this
#persons <- read_csv("../input/Persons.csv")
#make sure the data folder and the code are in the same directory,else replace the parameter of read_csv with the absolute path of the data folder
#ignore the warnings if any for the below line
emails <- read_csv("Hillary Clinton public emails dataset/output/Emails.csv")
removeSpecialChars <- function(x) gsub("[^a-zA-Z0-9 ]"," ",x)

vcorp <- Corpus(VectorSource(emails$ExtractedBodyText))
#egcorp <- Corpus(VectorSource(emails$ExtractedBodyText))
#vcorp <- tm_map(vcorp, removeSpecialChars)
vcorp <- tm_map(vcorp, content_transformer(tolower))
vcorp <- tm_map(vcorp, PlainTextDocument)
vcorp <- tm_map(vcorp, removePunctuation)
vcorp <- tm_map(vcorp, removeNumbers)
vcorp <- tm_map(vcorp, stripWhitespace)
vcorp <- tm_map(vcorp, removeWords, stopwords("english"))

#ccorp<-0
docterm_mat = DocumentTermMatrix(vcorp)
#sparse = removeSparseTerms(docterm_mat, 0.95) #NOTE: Don't lower this value otherwise will make the system hang 
sparse=docterm_mat
drop_inds = which(rowSums(as.matrix(sparse))==0)
sparse = sparse[-drop_inds,]
#drop_inds2 = which(rowSums(as.matrix(docterm_mat))==0)
#docterm_mat = docterm_mat[-drop_inds2,]

#If we increase the num_topics, the time and memory requirements
# will also increase.Hence, for the purpose of milestone evaluation 
#we are keeping the value of number of topics to be 10.However,
#the final project implementation will have number of topics in the range of 20-25 
num_topics = 10 
# if memory doesn't allow 10 or if its taking more than 20 minutes for this line to run
#stop the execution of the script and try with smaller values of num_topics like 5.
fitted_lda = LDA(sparse,k=num_topics)

num_terms = 30
terms(fitted_lda,num_terms)
topicmodels_json_ldavis <- function(fitted, corpus, doc_term){
  # Find required quantities
  phi <- posterior(fitted)$terms %>% as.matrix
  theta <- posterior(fitted)$topics %>% as.matrix
  vocab <- colnames(phi)
  doc_length <- vector()
  for (i in 1:length(corpus)) {
    temp <- paste(corpus[[i]]$content, collapse = ' ')
    doc_length <- c(doc_length, stri_count(temp, regex = '\\S+'))
  }
  temp_frequency <- inspect(doc_term)
  freq_matrix <- data.frame(ST = colnames(temp_frequency),
                            Freq = colSums(temp_frequency))
  rm(temp_frequency)
  
  # Convert to json
  json_lda <- LDAvis::createJSON(phi = phi, theta = theta,
                                 vocab = vocab,
                                 doc.length = doc_length,
                                 term.frequency = freq_matrix$Freq)
  
  return(json_lda)
}

dtm2list <- apply(sparse, 1, function(x) {paste(rep(names(x), x), collapse=" ")})
new_corp <- Corpus(VectorSource(dtm2list))
js2<-topicmodels_json_ldavis(fitted_lda,new_corp,sparse)
serVis(js2, out.dir = 'vis', open.browser = TRUE)
