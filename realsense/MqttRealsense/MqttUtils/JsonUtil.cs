using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Utils
{
    public class JsonUtil
    {
        public static void writeConfiguration<T>(string path, T obj)
        {
            var file = new StreamWriter(path);
            var settings = new JsonSerializerSettings();
            settings.Formatting = Formatting.Indented;
            var s = JsonSerializer.Create(settings);
            s.Serialize(file, obj);
            file.Close();
        }

        public static void readConfiguration<T>(string path, out T sample)
        {
            sample = JsonConvert.DeserializeObject<T>(System.IO.File.ReadAllText(path));
        }

        public static string SerializeObject<T>(T toSerialize)
        {
            return JsonConvert.SerializeObject(toSerialize, Formatting.Indented);
        }
    }
}
