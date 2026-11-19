require 'json'
root = File.expand_path('..', __dir__)
config = JSON.parse(File.read(File.join(root, 'starter.config.json')))
flavors = JSON.parse(File.read(File.join(root, 'config/flavors.json')))
selected = ARGV.empty? ? flavors.keys : ARGV
abort 'Choose production, dev, or qa' unless (selected - flavors.keys).empty?
unless config['modules'].include?('firebase')
  puts 'Firebase module is disabled'
  exit
end
missing = selected.reject do |name|
  relative = "ios/Firebase/#{name}/GoogleService-Info.plist"
  present = File.file?(File.join(root, relative))
  puts "#{present ? 'PASS' : 'MISSING'} #{relative} (#{config['iosId']}#{flavors[name]['suffix']})"
  present
end
exit(missing.empty? ? 0 : 1)
