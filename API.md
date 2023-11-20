/observations




/documents 
    /pdf
    /html
    /confluence
    /msword
    /mspowerpoint
    /url
    /unstructured
    /images
    /markdown

    :split
    :addSummary
    :addTakeaway
    :addKeyQuote
    :addProblem
    :addSolution
    :addKeyImage

    id              INT
    hash            STR
    type            STR     (observation)
    origFormat      STR     (pdf)
    text            STR     
    sourceMeta:  
        url:        STR     (https://) (trimmed down)
        title:      STR
        desc:       STR
        links:      [STR]   (urls)
        image:      STR     (url)
        author:     STR
        source      STR
        published:  datetime
        ttr:
    generatedMeta:
        summary:    STR
        takeaway:   STR
        quote:      STR[]
        problem:    STR[]
        solution:   STR[]
        image:      STR[]   
    splitStatus:    STR     (what splitter type?)
    scrapeError:    BOOL
    tokens          INT

/queries
    id:             INT
    text:           STR
    embedding       VEC
    tokens          INT

/prompts

/pipes
    :split 
        docs(id) -> splitFunc()->[ chunks(id) -> :addQuestions, :addAnswers, :addEmbedding, :addVector ] -> splitStatus
    :addSummary 
    :addTakeaway
    :addKeyQuote
    :addProblem
    :addSolution
    :addKeyImage


/models

/chunks
    :addEmbedding
    :addQuestions
    :addAnswers
    :addVector
    :deleteVector

    id          INT
    hash        STR
    text        STR
    documentId  INT
    embedding   VEC
    questions   [STR]   (optional)
    answers     [STR]   (optional)
    raw_ques    STR     (remove later)
    raw_ans     STR     (remove later)
    tokens      INT


/tags
           

/scenario
    id
    hash
    text
    docs
    images

/actions
    :qa ?num=4 
    :qa ?source=true
    :qa ?otherfield=1

    :search ?num=4 
    :search ?source=true
    :search ?otherfield=1

    (find)  ? (as normal in PG)












    
    
    
