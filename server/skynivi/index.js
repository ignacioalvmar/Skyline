module.exports = function(app, fs) 
{
    // SUPPORT Skynivi configuration
    app.get('/GetSkyniviConfig', function (req, res)
    {
        fs.readFile("./SkyniviScenarios/" + req.query.fileName, "utf8", function(err, file) {
            if (err) 
            {
                console.log(err.message);
                res.status(500).send(err.message);            
            }
            else 
            {
                console.log('GetSkyniviConfig GET ok: ' + req.query.fileName);
                res.set('Content-Type', 'text/xml');
                res.send(file);
            }
        });
    });

    app.post('/SaveSkyniviConfig', function (req, res)
    {
        fs.writeFile("./SkyniviScenarios/" + req.body.fileName, req.body.content, "utf8", function(err) 
        {
            if (err) 
            {
                console.log(err);
                res.status(500).send(err);
            }
            else 
            {
                console.log('SaveSkyniviConfig POST ok: ' + req.body.fileName);
                res.send('done saving'  + req.body.fileName+': '  + req.body.content);
            }
        });
    });
}